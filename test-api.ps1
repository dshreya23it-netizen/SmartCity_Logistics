# test-api.ps1
Write-Host "=== Testing SmartCity Logistics API ===" -ForegroundColor Green
Write-Host "Server: http://localhost:5000`n" -ForegroundColor Cyan

# Function to make API calls
function Test-API {
    param(
        [string]$Method = "GET",
        [string]$Endpoint = "/",
        [string]$Body = $null
    )
    
    $uri = "http://localhost:5000$Endpoint"
    
    Write-Host "$Method $Endpoint" -ForegroundColor Yellow
    
    try {
        if ($Body -and ($Method -eq "POST" -or $Method -eq "PUT")) {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Body $Body -ContentType "application/json" -ErrorAction Stop
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -ErrorAction Stop
        }
        
        Write-Host "✅ Success" -ForegroundColor Green
        $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor Cyan
        return $response
        
    } catch {
        Write-Host "❌ Error: $($_.Exception.Message)" -ForegroundColor Red
        
        if ($_.Exception.Response) {
            $statusCode = $_.Exception.Response.StatusCode.value__
            Write-Host "Status Code: $statusCode" -ForegroundColor Red
            
            # Try to read error response body
            try {
                $stream = $_.Exception.Response.GetResponseStream()
                $reader = New-Object System.IO.StreamReader($stream)
                $errorBody = $reader.ReadToEnd()
                $reader.Close()
                
                if ($errorBody) {
                    Write-Host "Error Body: $errorBody" -ForegroundColor Red
                }
            } catch {
                Write-Host "Could not read error body" -ForegroundColor Red
            }
        }
        
        return $null
    }
    
    Write-Host ""
}

# Run tests
Test-API -Method GET -Endpoint "/"
Test-API -Method GET -Endpoint "/health"
Test-API -Method GET -Endpoint "/sensors"

# Create a sensor
$sensorBody = @{
    sensorId = "temp-sensor-$(Get-Date -Format 'HHmmss')"
    sensorType = "temperature"
    location = @{
        latitude = 40.7128
        longitude = -74.0060
        address = "Test Location"
    }
    status = "active"
    data = @{
        value = 22.5
        unit = "celsius"
    }
} | ConvertTo-Json -Compress

Write-Host "Creating sensor with data:" -ForegroundColor Yellow
Write-Host $sensorBody -ForegroundColor Gray

$createdSensor = Test-API -Method POST -Endpoint "/sensors" -Body $sensorBody

# Get sensors again
Test-API -Method GET -Endpoint "/sensors"

# If sensor was created, test getting it by ID
if ($createdSensor -and $createdSensor.data -and $createdSensor.data._id) {
    $sensorId = $createdSensor.data._id
    Write-Host "Testing GET /sensors/$sensorId" -ForegroundColor Yellow
    
    # Note: Our simple server doesn't have this endpoint yet, but we'll add it
    # Test-API -Method GET -Endpoint "/sensors/$sensorId"
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green