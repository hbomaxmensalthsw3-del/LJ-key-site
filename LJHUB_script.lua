local Players = game:GetService("Players")
local HttpService = game:GetService("HttpService")
local RbxAnalyticsService = game:GetService("RbxAnalyticsService")

local player = Players.LocalPlayer

local API_URL = "https://dbc51966-7d19-4d7c-9e31-ef9e203bf34c-00-3ibl36ej6e6tw.picard.replit.dev/api/keys/verify"
local KEY_FILE = "LJHUB_KEY.txt"

local req = request or http_request or syn and syn.request

--================ VALIDAR KEY =================--
local function validateKey(key)

    if not req then
        return false
    end

    local hwid = RbxAnalyticsService:GetClientId()

    local success, response = pcall(function()
        return req({
            Url = API_URL,
            Method = "POST",
            Headers = {
                ["Content-Type"] = "application/json"
            },
            Body = HttpService:JSONEncode({
                key = key,
                hwid = hwid
            })
        })
    end)

    if success and response and response.StatusCode == 200 then

        local ok, data = pcall(function()
            return HttpService:JSONDecode(response.Body)
        end)

        if ok and data.success == true then
            return true
        end
    end

    return false
end

--================ SCRIPT PRINCIPAL =================--
local function StartScript()

    game:GetService("StarterGui"):SetCore("SendNotification",{
        Title = "LJ HUB",
        Text = "KEY VALIDADA",
        Duration = 5
    })

    loadstring(game:HttpGet("https://pastebin.com/raw/K2FxCqqh"))()

end

--================ AUTO LOGIN =================--
if readfile and isfile and isfile(KEY_FILE) then

    local savedKey = readfile(KEY_FILE)

    if validateKey(savedKey) then
        StartScript()
        return
    else
        if delfile then
            pcall(function()
                delfile(KEY_FILE)
            end)
        end
    end
end

--================ UI =================--
local gui = Instance.new("ScreenGui")
gui.Name = "LJHUB_KEYSYSTEM"
gui.ResetOnSpawn = false
gui.Parent = player:WaitForChild("PlayerGui")

local frame = Instance.new("Frame")
frame.Parent = gui
frame.Size = UDim2.new(0,260,0,150)
frame.Position = UDim2.new(0.5,-130,0.5,-75)
frame.BackgroundColor3 = Color3.fromRGB(20,20,20)

Instance.new("UICorner", frame)

local stroke = Instance.new("UIStroke")
stroke.Color = Color3.fromRGB(0,120,255)
stroke.Thickness = 1.5
stroke.Parent = frame

local title = Instance.new("TextLabel")
title.Parent = frame
title.Size = UDim2.new(1,0,0,35)
title.BackgroundTransparency = 1
title.Text = "LJ HUB KEY SYSTEM"
title.TextColor3 = Color3.new(1,1,1)
title.Font = Enum.Font.GothamBold
title.TextSize = 14

local box = Instance.new("TextBox")
box.Parent = frame
box.Size = UDim2.new(1,-20,0,35)
box.Position = UDim2.new(0,10,0,50)
box.BackgroundColor3 = Color3.fromRGB(35,35,35)
box.PlaceholderText = "Digite sua key"
box.PlaceholderColor3 = Color3.fromRGB(140,140,140)
box.Text = ""
box.TextColor3 = Color3.new(1,1,1)
box.Font = Enum.Font.Gotham
box.TextSize = 13

Instance.new("UICorner", box)

local button = Instance.new("TextButton")
button.Parent = frame
button.Size = UDim2.new(1,-20,0,35)
button.Position = UDim2.new(0,10,0,100)
button.BackgroundColor3 = Color3.fromRGB(0,120,255)
button.Text = "VALIDAR"
button.TextColor3 = Color3.new(1,1,1)
button.Font = Enum.Font.GothamBold
button.TextSize = 13

Instance.new("UICorner", button)

--================ VALIDAR =================--
button.MouseButton1Click:Connect(function()

    local key = box.Text

    if key == "" then

        button.Text = "DIGITE UMA KEY"

        task.wait(1)

        button.Text = "VALIDAR"

        return
    end

    button.Text = "VERIFICANDO..."

    if validateKey(key) then

        if writefile then
            pcall(function()
                writefile(KEY_FILE, key)
            end)
        end

        button.BackgroundColor3 = Color3.fromRGB(0,170,90)
        button.Text = "KEY CORRETA"

        task.wait(1)

        gui:Destroy()

        StartScript()

    else

        button.BackgroundColor3 = Color3.fromRGB(170,40,40)
        button.Text = "KEY INVALIDA"

        task.wait(1.5)

        button.BackgroundColor3 = Color3.fromRGB(0,120,255)
        button.Text = "VALIDAR"

    end
end)

--================ DRAG =================--
local UIS = game:GetService("UserInputService")

local dragging
local dragInput
local dragStart
local startPos

frame.InputBegan:Connect(function(input)

    if input.UserInputType == Enum.UserInputType.MouseButton1 then

        dragging = true
        dragStart = input.Position
        startPos = frame.Position

        input.Changed:Connect(function()

            if input.UserInputState == Enum.UserInputState.End then
                dragging = false
            end
        end)
    end
end)

frame.InputChanged:Connect(function(input)

    if input.UserInputType == Enum.UserInputType.MouseMovement then
        dragInput = input
    end
end)

UIS.InputChanged:Connect(function(input)

    if input == dragInput and dragging then

        local delta = input.Position - dragStart

        frame.Position = UDim2.new(
            startPos.X.Scale,
            startPos.X.Offset + delta.X,
            startPos.Y.Scale,
            startPos.Y.Offset + delta.Y
        )
    end
end)
