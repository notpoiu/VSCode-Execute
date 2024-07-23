local HttpService, Link = game:GetService("HttpService"), nil

local HasProperty = function(ins, prop)
    local s = pcall(function()
        local e = ins[prop]
    end)
    return s
end

local HttpGet = HasProperty(game, "HttpGet") and function(url: string) return game:HttpGet(url) end or httpget or httpGet or HttpGet or Httpget or function(url) return HttpService:GetAsync(url) end
local Request = request or http and http.request or Http and Http.request or function(options) local s = pcall(HttpService.GetAsync, HttpService, options.Url, false, options.Headers) if not s then task.defer(error, options.Headers.ConsoleOutput) end end

Link = "http://localhost:6182/"

local isLocalHost = Link:find("localhost") ~= nil or Link:find("127.0.0.1") ~= nil

local OldBody = HttpGet(Link)

local Get = function()
    local Body = HttpGet(Link)

    if OldBody ~= Body and Body ~= '""' then
        local Callable, Error = loadstring(HttpService:JSONDecode(Body))
		print(Callable)
        if Callable ~= nil then
            Callable()
        else
            Request{
                Url = Link,
                Method = "GET",
                Headers = {
                    ConsoleOutput = `[ERROR]: {Error}`
                }
            }
        end
    end

    OldBody = Body
end

while task.wait(not isLocalHost and .75 or nil) do
	pcall(Get)
end