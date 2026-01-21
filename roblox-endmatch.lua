-- Roblox Server Script dla `:endmatch`
-- Ten skrypt obsługuje komendę :endmatch i wysyła dane do API

local HttpService = game:GetService("HttpService")
local Players = game:GetService("Players")

-- Konfiguracja
local API_URL = "https://match-tracker-node--motorola4interi.replit.app/api/endmatch"
local MATCH_DATA = {
	matchId = "",
	homeTeamId = "",
	awayTeamId = "",
	homeScore = 0,
	awayScore = 0,
	scorers = {}
}

-- Funkcja do pobrania avatara gracza
local function getPlayerAvatar(userId)
	return string.format("https://www.roblox.com/headshot-thumbnail/image?userId=%d&width=150&height=150&format=png", userId)
end

-- Funkcja do wysłania danych o zakończonym meczu
local function sendMatchResult()
	local success, response = pcall(function()
		local jsonData = HttpService:JSONEncode({
			matchId = MATCH_DATA.matchId,
			homeTeamId = MATCH_DATA.homeTeamId,
			awayTeamId = MATCH_DATA.awayTeamId,
			homeScore = MATCH_DATA.homeScore,
			awayScore = MATCH_DATA.awayScore,
			scorers = MATCH_DATA.scorers
		})
		
		return HttpService:PostAsync(
			API_URL,
			jsonData,
			Enum.HttpContentType.ApplicationJson,
			false,
			{
				["Content-Type"] = "application/json"
			}
		)
	end)
	
	if success then
		print("✅ Match result saved successfully!")
		print("Response:", response)
		return true
	else
		warn("❌ Failed to save match result:", response)
		return false
	end
end

-- Funkcja do dodania strzelca
local function addScorer(playerName, playerId, teamId, goals)
	local avatarUrl = getPlayerAvatar(playerId)
	
	-- Sprawdź czy gracz już strzelał
	local found = false
	for i, scorer in ipairs(MATCH_DATA.scorers) do
		if scorer.playerId == playerId then
			scorer.goals = scorer.goals + goals
			found = true
			break
		end
	end
	
	-- Jeśli nie, dodaj nowego strzelca
	if not found then
		table.insert(MATCH_DATA.scorers, {
			playerName = playerName,
			playerId = playerId,
			teamId = teamId,
			goals = goals,
			avatarUrl = avatarUrl
		})
	end
end

-- Komenda :endmatch
game.Players.PlayerAdded:Connect(function(player)
	player.Chatted:Connect(function(message)
		-- Tylko admin może użyć komendy
		if not player:GetRankInGroup(YOUR_GROUP_ID) >= ADMIN_RANK then
			return
		end
		
		-- Przykład: :endmatch m1 UNI LGD 2 1
		-- m1 = matchId, UNI = homeTeamId, LGD = awayTeamId, 2 = homeScore, 1 = awayScore
		local args = string.split(message, " ")
		
		if args[1]:lower() == ":endmatch" then
			if #args < 6 then
				player:Kick("Błąd: :endmatch [matchId] [homeTeamId] [awayTeamId] [homeScore] [awayScore]")
				return
			end
			
			MATCH_DATA.matchId = args[2]
			MATCH_DATA.homeTeamId = args[3]
			MATCH_DATA.awayTeamId = args[4]
			MATCH_DATA.homeScore = tonumber(args[5]) or 0
			MATCH_DATA.awayScore = tonumber(args[6]) or 0
			
			print("📊 Match Data Collected:")
			print("Match ID:", MATCH_DATA.matchId)
			print("Home Team:", MATCH_DATA.homeTeamId, "Score:", MATCH_DATA.homeScore)
			print("Away Team:", MATCH_DATA.awayTeamId, "Score:", MATCH_DATA.awayScore)
			
			-- Wyślij dane
			sendMatchResult()
		end
		
		-- Przykład: :addgoal PlayerName 123456 UNI 1
		-- PlayerName = nazwa gracza, 123456 = Roblox UserId, UNI = teamId, 1 = liczba goli
		if args[1]:lower() == ":addgoal" then
			if #args < 5 then
				player:Kick("Błąd: :addgoal [playerName] [playerId] [teamId] [goals]")
				return
			end
			
			local playerName = args[2]
			local playerId = tonumber(args[3])
			local teamId = args[4]
			local goals = tonumber(args[5]) or 1
			
			addScorer(playerName, playerId, teamId, goals)
			
			print("⚽ Goal added for:", playerName, "Goals:", goals)
		end
	end)
end)

-- Przykład użycia w grze:
--[[
	1. Podczas meczu, gdy ktoś strzeli gola:
	   :addgoal MarcPelaz 123456789 UNI 1
	   
	2. Gdy mecz się kończy:
	   :endmatch m1 UNI LGD 2 1
	   
	Dane zostaną wysłane do API i zapisane w bazie danych:
	- Zaktualizuje tabelę ligową
	- Doda strzelców do statystyk
	- Zapisze wynik meczu
]]

print("⚽ Match System Loaded!")
print("Commands:")
print("  :addgoal [playerName] [playerId] [teamId] [goals]")
print("  :endmatch [matchId] [homeTeamId] [awayTeamId] [homeScore] [awayScore]")
