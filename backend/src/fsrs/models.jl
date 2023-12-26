

@enum CardState New Learning Review Relearning
MLStyle.is_enum(::CardState) = true
MLStyle.enum_matcher(e::CardState, expr) = :($e === $expr)
@enum CardRating NoRating Again Hard Good Easy
MLStyle.is_enum(::CardRating) = true
MLStyle.enum_matcher(e::CardRating, expr) = :($e === $expr)

struct ReviewLog
    rating::Int
    scheduled_days::Int
    elapsed_days::Int
    review::DateTime
    state::Int
end

struct Card
    due::DateTime
    stability::Float64
    difficulty::Float64
    elapsed_days::Int
    scheduled_days::Int
    reps::Int
    lapses::Int
    state::CardState
    last_review::DateTime
end
Card(; due=now(), stability=0, difficulty=0, elapsed_days=0, sheduled_days=0, reps=0, lapses=0, state=New, last_review=now()) =
    Card(due, stability, difficulty, elapsed_days, sheduled_days, reps, lapses, state, last_review)

retrievability(card::Card; now=now()) =
    if card.state == Review
        elapsed_days = max(0, (now - card.last_review).days)
        (1 + elapsed_days / (9 * self.stability))^-1
    else
        NaN
    end

struct SchedulingInfo
    card::Card
    reviewlog::ReviewLog
end

# struct SchedulingCards end

update_state(state::CardState, rating::CardRating) =
    @match state begin
        New => rating == Easy ? (Review, 0) : (Learning, 0)
        Review => rating == Again ? (Relearning, 1) : (Review, 0)
        _ => rating in [Good, Easy] ? (Review, 0) : (state, 0)
    end


schedule(rating::CardRating, hard_interval, good_interval, easy_interval; now=now()) =
    let scheduled_days = [0, hard_interval, good_interval, easy_interval][Int(rating)]
        if rating == Again
            due = now + Minute(5)
        elseif rating == Hard && hard_interval == 0
            due = now + Minute(minutes=5)
        else
            due = now + Day(scheduled_days)
        end
        scheduled_days, due
    end

record_log(rating::CardRating, card::Card, now::DateTime)::SchedulingInfo =
    let x = 1
        3
    end

struct Parameters
    request_retention::Float64
    maximum_interval::Int
    w::Array{Float64}
end
w_default = [0.4, 0.6, 2.4, 5.8, 4.93, 0.94, 0.86, 0.01, 1.49, 0.14, 0.94, 2.18, 0.05, 0.34, 1.26, 0.29, 2.61]
Parameters(; request_retention=0.9, maximum_interval=36500, w=w_default) = Parameters(request_retention, maximum_interval, w)
p::Parameters = Parameters()

init_stability(r::CardRating; p::Parameters) =
    max(p.w[Int(r)], 0.1)
init_difficulty(r::CardRating; p::Parameters) =
    min(max(p.w[5] - p.w[6] * (Int(r) - 3), 1), 10)

init_ds(r::CardRating; p::Parameters=p) =
    init_difficulty(r; p), init_stability(r; p)

Card(r::CardRating; p=p) =
    let (difficulty, stability) = init_ds(r; p)
        Card(; difficulty, stability)
    end
