# debug-test.ps1
Write-Host "=== DEBUG TEST ===" -ForegroundColor Green
Write-Host "Testing API step by step`n" -ForegroundColor Yellow

# Function to test with full error handling
function Test-Endpoint {
    param(
        [string]$Url,
        [string]$Method = "GET",
        [string]$Body = $null
    )
    
    Write-Host "`n$(Get-Date -Format 'HH:mm:ss') - $Method $Url" -ForegroundColor Cyan
    
    $params = @{
        Uri = $Url
        Method = $Method
        ErrorAction = 'Stop'
    }
    
    if ($Body) {
        $params.Body = $Body
        $params.ContentType = 'application/json'
        Write-Host "Body: $Body" -ForegroundColor Gray
    }
    
    try {
        $response = Invoke-RestMethod @params
        Write-Host "✅ SUCCESS" -ForegroundColor Green
        
        if ($response -is [string]) {
            Write-Host "Response (string): $response" -ForegroundColor White
        } else {
            Write-Host "Response (object):" -ForegroundColor White
            $response | ConvertTo-Json -Depth 5 | Write-Host -ForegroundColor White
        }
        
        return $response
        
    } catch {
        Write-Host "❌ ERROR" -ForegroundColor Red
        Write-Host "Status: $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
        Write-Host "Message: $($_.Exception.Message)" -ForegroundColor Red
        
        # Try to read the response body
        if ($_.Exception.Response) {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errorBody = $reader.ReadToEnd()
            $reader.Close()
            
            if ($errorBody) {
                Write-Host "Error Body:" -ForegroundColor Red
                $errorBody | Write-Host -ForegroundColor Red
            }
        }
        
        return $null
    }
}

# Base URL
$baseUrl = "http://localhost:5000"

# Test 1: Root endpoint
Write-Host "`n" + ("=" * 50)
Write-Host "TEST 1: Root endpoint" -ForegroundColor Yellow
Test-Endpoint -Url "$baseUrl/"

# Test 2: Health check
Write-Host "`n" + ("=" * 50)
Write-Host "TEST 2: Health check" -ForegroundColor Yellow
Test-Endpoint -Url "$baseUrl/health"

# Test 3: Get sensors (before)
Write-Host "`n" + ("=" * 50)
Write-Host "TEST 3: Get sensors (before)" -ForegroundColor Yellow
$before = Test-Endpoint -Url "$baseUrl/sensors"

# Test 4: Create a sensor
Write-Host "`n" + ("=" * 50)
Write-Host "TEST 4: Create a sensor" -ForegroundColor Yellow

$sensorBody = @{
    sensorId = "debug-test-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    sensorType = "temperature"
    location = @{
        latitude = 40.7128
        longitude = -74.0060
        address = "Debug Test Location"
    }
    status = "active"
    data = @{
        temperature = 22.5
        humidity = 45
        unit = "celsius"
    }
} | ConvertTo-Json -Compress

$created = Test-Endpoint -Url "$baseUrl/sensors" -Method POST -Body $sensorBody

# Test 5: Get sensors (after)
Write-Host "`n" + ("=" * 50)
Write-Host "TEST 5: Get sensors (after)" -ForegroundColor Yellow
$after = Test-Endpoint -Url "$baseUrl/sensors"

# Compare counts
if ($before -and $after) {
    $beforeCount = $before.count
    $afterCount = $after.count
    
    Write-Host "`n" + ("=" * 50)
    Write-Host "RESULTS SUMMARY:" -ForegroundColor Green
    Write-Host "Sensors before: $beforeCount" -ForegroundColor Cyan
    Write-Host "Sensors after:  $afterCount" -ForegroundColor Cyan
    
    if ($afterCount -gt $beforeCount) {
        Write-Host "✅ SUCCESS: Sensor was added!" -ForegroundColor Green
        Write-Host "New sensor count: $afterCount" -ForegroundColor Green
    } else {
        Write-Host "⚠️  WARNING: Sensor count didn't increase" -ForegroundColor Yellow
    }
}

# Test 6: Check MongoDB directly
Write-Host "`n" + ("=" * 50)
Write-Host "TEST 6: Check MongoDB directly" -ForegroundColor Yellow

Write-Host "`nChecking MongoDB via mongosh..." -ForegroundColor Cyan
try {
    $mongoResult = mongosh smartcity_logistics --eval "db.sensors.countDocuments()" --quiet
    Write-Host "MongoDB sensor count: $mongoResult" -ForegroundColor White
    
    $mongoDocs = mongosh smartcity_logistics --eval "db.sensors.find().sort({_id: -1}).limit(3).pretty()" --quiet
    Write-Host "`nRecent documents:" -ForegroundColor White
    $mongoDocs
    
} catch {
    Write-Host "❌ Failed to check MongoDB: $_" -ForegroundColor Red
}

Write-Host "`n" + ("=" * 50)
Write-Host "TEST COMPLETE" -ForegroundColor Green