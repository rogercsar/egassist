# Script PowerShell para fazer commit e push
# Execute: .\commit.ps1

Write-Host "=== EG Assist - Commit e Push ===" -ForegroundColor Cyan
Write-Host ""

# Verificar se Git está instalado
try {
    $gitVersion = git --version
    Write-Host "Git encontrado: $gitVersion" -ForegroundColor Green
} catch {
    Write-Host "ERRO: Git não está instalado ou não está no PATH" -ForegroundColor Red
    Write-Host "Por favor, instale o Git: https://git-scm.com/download/win" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "1. Verificando status do repositório..." -ForegroundColor Yellow
git status

Write-Host ""
$confirm = Read-Host "Deseja continuar com o commit? (S/N)"
if ($confirm -ne "S" -and $confirm -ne "s") {
    Write-Host "Operação cancelada." -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "2. Adicionando arquivos..." -ForegroundColor Yellow
git add .

Write-Host ""
Write-Host "3. Fazendo commit..." -ForegroundColor Yellow
$commitMessage = @"
feat: Implementa Fase 1 - Segurança e Estabilidade

- Adiciona validação e sanitização de dados
- Implementa tratamento de erros centralizado
- Cria componentes reutilizáveis (Loading, Button, Toast, ConfirmDialog)
- Adiciona middleware de validação no backend
- Melhora tratamento de erros em todos os endpoints
- Adiciona migration com constraints de banco de dados
- Implementa confirmação para ações destrutivas
- Adiciona feedback visual para usuário (toasts, loading states)

Melhorias de segurança:
- Validação de IDs em todos os endpoints
- Sanitização de strings de entrada
- Validação de relacionamentos (verifica ownership)
- Constraints CHECK no banco de dados

Melhorias de UX:
- Feedback visual em todas as operações
- Mensagens de erro claras e amigáveis
- Confirmação antes de deletar recursos
- Loading states consistentes
"@

git commit -m $commitMessage

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Commit realizado com sucesso!" -ForegroundColor Green
    
    Write-Host ""
    Write-Host "4. Verificando remote..." -ForegroundColor Yellow
    $remote = git remote get-url origin 2>$null
    if ($remote) {
        Write-Host "Remote encontrado: $remote" -ForegroundColor Green
    } else {
        Write-Host "Remote não configurado. Configurando..." -ForegroundColor Yellow
        git remote add origin https://github.com/rogercsar/egassist.git
    }
    
    Write-Host ""
    $pushConfirm = Read-Host "Deseja fazer push para o GitHub? (S/N)"
    if ($pushConfirm -eq "S" -or $pushConfirm -eq "s") {
        Write-Host ""
        Write-Host "5. Fazendo push..." -ForegroundColor Yellow
        
        # Tentar descobrir a branch atual
        $branch = git branch --show-current
        if (-not $branch) {
            $branch = "main"
        }
        
        git push -u origin $branch
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host ""
            Write-Host "Push realizado com sucesso!" -ForegroundColor Green
            Write-Host ""
            Write-Host "=== Próximos Passos ===" -ForegroundColor Cyan
            Write-Host "1. Acesse o Netlify Dashboard" -ForegroundColor White
            Write-Host "2. O deploy deve iniciar automaticamente" -ForegroundColor White
            Write-Host "3. Verifique as variáveis de ambiente no Netlify" -ForegroundColor White
            Write-Host "4. Execute a migration 4 no banco de dados" -ForegroundColor White
        } else {
            Write-Host ""
            Write-Host "ERRO ao fazer push. Verifique as credenciais do Git." -ForegroundColor Red
        }
    } else {
        Write-Host ""
        Write-Host "Push cancelado. Execute 'git push' manualmente quando estiver pronto." -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "ERRO ao fazer commit. Verifique os arquivos e tente novamente." -ForegroundColor Red
}

Write-Host ""


