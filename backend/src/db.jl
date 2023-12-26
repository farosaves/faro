using SQLite, FunnyORM, DBInterface, Dates

include("models/Users.jl")
include("models/Words.jl")
include("models/LearningWords.jl")

add_card!(db::FunnyORM.DB, user::User,)

struct ReviewConfig
    initfail_minutes::Int
    initpass_minutes::Int
    extend_period_fact::Float64
    cut_period_fact::Float64
end
ReviewConfig() = ReviewConfig(2, 10, 1.0, 0.1)

reviewed!(db::FunnyORM.DB, user::User, word::Word; pass::Bool=true, config::ReviewConfig=ReviewConfig()) =
    let q = db[LearningWord[userId=user.userId, wordId=word.wordId]]
        if isempty(q)
            LearningWord(db)(userId=user.userId, wordId=word.wordId, lastSeen=string(now()),
                showAgainOn=string(now() + Minute(pass ? config.initpass_minutes : config.initfail_minutes)))
        else  # If the word was seen before, calculate how long ago it was last seen
            lw = only(q)
            time_since_last_seen = now() - DateTime(lw.lastSeen)
            previous_period = DateTime(lw.showAgainOn) - DateTime(lw.lastSeen)
            new_period = pass ?
                         config.extend_period_fact * time_since_last_seen + previous_period :
                         time_since_last_seen ÷ floor(1 / config.cut_period_fact)

            db[lw](userId=user.userId, wordId=word.wordId, lastSeen=string(now()),
                showAgainOn=string(new_period + now()))
        end
    end


due(db::FunnyORM.DB, user::User, by::DateTime=now()) = db[LearningWord[userId=user.userId, showAgainOn="" => string(by)]]