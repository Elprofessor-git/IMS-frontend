@echo off
echo ========================================
echo TestSprite Configuration Verification
echo ========================================

echo.
echo Checking environment variables:
echo.

if defined TESTSPRITE_API_KEY (
    echo ✓ TESTSPRITE_API_KEY is set
    echo   Value: %TESTSPRITE_API_KEY%
) else (
    echo ✗ TESTSPRITE_API_KEY is NOT set
)

if defined TESTSPRITE_PROJECT_PATH (
    echo ✓ TESTSPRITE_PROJECT_PATH is set
    echo   Value: %TESTSPRITE_PROJECT_PATH%
) else (
    echo ✗ TESTSPRITE_PROJECT_PATH is NOT set
)

if defined TESTSPRITE_LOCAL_PORT (
    echo ✓ TESTSPRITE_LOCAL_PORT is set
    echo   Value: %TESTSPRITE_LOCAL_PORT%
) else (
    echo ✗ TESTSPRITE_LOCAL_PORT is NOT set
)

if defined TESTSPRITE_TYPE (
    echo ✓ TESTSPRITE_TYPE is set
    echo   Value: %TESTSPRITE_TYPE%
) else (
    echo ✗ TESTSPRITE_TYPE is NOT set
)

echo.
echo Checking config file:
if exist "testsprite_tests\tmp\config.json" (
    echo ✓ Config file exists
    type "testsprite_tests\tmp\config.json"
) else (
    echo ✗ Config file does not exist
)

echo.
echo ========================================
pause
