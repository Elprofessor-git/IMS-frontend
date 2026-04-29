Write-Host "Correction des erreurs de lint..." -ForegroundColor Green

# 1. Supprimer les console.log inutiles
Get-ChildItem -Path "src" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "console\.log\([^)]*\);`n?", ""
    Set-Content $_.FullName $content
}

# 2. Supprimer les imports non utilisés
Get-ChildItem -Path "src" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName
    $imports = $content | Select-String "import \{([^}]+)\} from"
    foreach ($import in $imports) {
        $items = $import.Matches.Groups[1].Value.Split(",").Trim()
        foreach ($item in $items) {
            if ($content | Select-String -Pattern $item -AllMatches | Select-Object -Expand Matches | Measure-Object | Select-Object -Expand Count -eq 1) {
                $content = $content -replace "$item,?\s*", ""
            }
        }
    }
    Set-Content $_.FullName $content
}

# 3. Ajouter les types de retour manquants
Get-ChildItem -Path "src" -Filter "*.ts" -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    $content = $content -replace "ngOnInit\(\)\s*{", "ngOnInit(): void {"
    $content = $content -replace "ngOnDestroy\(\)\s*{", "ngOnDestroy(): void {"
    $content = $content -replace "constructor\(\)\s*{}", "constructor() { /* TODO: Implement */ }"
    Set-Content $_.FullName $content
}

Write-Host "Corrections terminées. Veuillez vérifier les modifications et exécuter lint à nouveau." -ForegroundColor Green
