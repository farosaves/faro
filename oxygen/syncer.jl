using BetterFileWatching

# run from root

f1 = "supabase-sveltekit/src/lib/shared"
f2 = "fcextension/src/lib/shared"

mvpath(str::String, src::String, tgt::String) =
    let escaped_src = escape_string(src, "\\.+*?^\$[](){}|")
        replace(str, Regex(".*$escaped_src") => tgt)
    end

lk = ReentrantLock()
handler(src, tgt) = ev ->  # :BetterFileWatching.Created
    let path = only(ev.paths), force = true, tgt_path = mvpath(path, src, tgt)
        lock(lk)
        @info ev
        if ev isa BetterFileWatching.Removed
            if !ispath(path)
                @info "Deleted"
                rm(tgt_path; force)
            end
        elseif ispath(path) && !ispath(tgt_path)
            @info "Created"
            cp(path, tgt_path; force)
        elseif isfile(path) && isfile(tgt_path) && read(path) ≠ read(tgt_path)
            @info "Modified", length(read(path)), length(read(tgt_path)), read(path) == read(tgt_path)
            cp(path, tgt_path; force)
        end
        sleep(0.1)
        unlock(lk)
    end

first2second = @async watch_folder(handler(f1, f2), f1)
second2first = @async watch_folder(handler(f2, f1), f2)

println("ctrl+C to turn off")
try
    wait()
catch
    schedule(first2second, InterruptException(); error=true)
    schedule(second2first, InterruptException(); error=true)
end
