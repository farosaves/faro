using Dates, MLStyle

include("models.jl")

next_interval(stab::Real; p::Parameters) =
    let new_interval = stab * 9 * (1 / p.request_retention - 1)
        min(max(round(new_interval), 1), p.maximum_interval)
    end

mean_reversion(init::Real, current::Real; p=p)::Real =
    p.w[7] * init + (1 - p.w[7]) * current

next_difficulty(d::Real, r::CardRating; p=p) =
    let next_d = d - p.w[7] * (Int(r) - 3)
        min(max(mean_reversion(p.w[5], next_d; p), 1), 10)
    end

next_recall_stability(d::Real, s::Real, r::Real, rating::CardRating; p=p) =
    let hard_penalty = rating == Hard ? p.w[16] : 1,
        easy_bonus = rating == Easy ? p.w[17] : 1

        s * (1 + exp(p.w[9]) *
                 (11 - d) *
                 (s^-p.w[10]) *
                 (exp((1 - r) * p.w[11]) - 1) *
                 hard_penalty *
                 easy_bonus)
    end

next_forget_stability(d::Real, s::Real, r::Real; p=p) =
    p.w[12] *
    (d^-p.w[13]) *
    ((s + 1)^p.w[14] - 1) *
    exp((1 - r) * p.w[15])

next_ds(c::Card, r::CardRating, retrievability::Real; p=p) =
    next_difficulty(c.difficulty, r; p), r == Again ?
                                         next_forget_stability(c.difficulty, c.stability, retrievability; p) :
                                         next_recall_stability(c.difficulty, c.stability, retrievability, r; p)


card = Card(Again)
next_ds(card, Easy, 0.8)


# again hard good easy
next_intervals(card::Card; now=now(), p=p) =
    @match card.state begin
        New => (Minute(1), Minute(5), Minute(10), Day(next_interval(card.stability; p)))
        Review => let retr = retrievability(card; now)
            Minute(5), collect(# compute new ds for the rating
                let (difficulty, stability) = next_ds(c, rating, retr)
                    Day(next_interval(stability; p))
                end
                for rating in [Hard, Good, Easy]
            )
        end
    end

repeat(card::Card, rating::CardRating; now=now(), p::Parameters=Parameters()) =
    let elapsed_days = card.state == New ? 0 : (now - card.last_review)
        last_review = now
        reps = card.reps + 1
        state = update_state(card.state, rating)
        if card.state == New
            ds = init_ds(card)
            easy_interval = next_interval(stability, p.request_retention)
            scheduled_days = easy_interval
            due = now + Day(easy_interval)
        elseif card.state == Learning || card.state == Relearning
            hard_interval = 0
            good_interval = self.next_interval(s.good.stability)
            easy_interval = max(self.next_interval(s.easy.stability), good_interval + 1)

            s.schedule(now, hard_interval, good_interval, easy_interval)
        elseif card.state == Review
            interval = card.elapsed_days
            last_d = card.difficulty
            last_s = card.stability
            retrievability = (1 + interval / (9 * last_s))^-1
            self.next_ds(s, last_d, last_s, retrievability)

            hard_interval = self.next_interval(s.hard.stability)
            good_interval = self.next_interval(s.good.stability)
            hard_interval = min(hard_interval, good_interval)
            good_interval = max(good_interval, hard_interval + 1)
            easy_interval = max(self.next_interval(s.easy.stability), good_interval + 1)
            s.schedule(now, hard_interval, good_interval, easy_interval)

        end
        Card(; elapsed_days)
    end