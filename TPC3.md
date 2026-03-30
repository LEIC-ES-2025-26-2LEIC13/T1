# Acceptance Testing

Este documento descreve como preparar o projeto e executar testes de aceitação usando Maestro Studio Desktop.

## 1. Setup

Utilizou-se o tutorial de youtube: Complete React Native Tutorial do youtuber Net Ninja de modo a fazer um setup inicial do projeto, assim como compreender o funcionamento do React Native e do framework Expo:

https://www.youtube.com/watch?v=J2j1yk-34OY&list=PL4cUxeGkcC9hNTz3sxqGTfxAwU-DIHJd2&index=1


**Nota:considera-se que o projeto já está inicializado e a funcionalidade a testar está implementada.**

Para este trabalho foi escolhida a ferramenta Maestro (Studio Desktop), um framework de automação de UI testing que ajuda a garantir a fiabilidade da aplicação. O Maestro funciona como black-box testing: simula interações reais do utilizador ao nível do dispositivo, sem acesso ao código-fonte nem a APIs internas.

## 2. Processo de Build

### 2.1 Build Android

No diretório do projeto, executar:

```bash
npx expo run:android
```

### 2.2 Configuração do Android SDK (se necessário)

Para builds locais, é necessário garantir que o Android SDK está acessível.

Se surgir o erro "SDK location not found", criar o ficheiro `android/local.properties` com:

```properties
sdk.dir=C\:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
```

Substituir `<username>` pelo utilizador do sistema operativo.

Depois disso, continuar o processo de build até conclusão.

## 3. Execução dos Acceptance Tests

1. Garantir que o emulador Android está em execução.
2. Após a build, o APK gerado será instalado no emulador.
3. Abrir o Maestro Studio Desktop.
4. Criar um projeto dentro do diretório do repositório.
5. Criar um novo teste .yaml e associá-lo à aplicação (`com.leico`).
6. Definir o fluxo esperado da aplicação e executar o teste.
7. Validar se o resultado obtido corresponde ao comportamento esperado.

## 4. Nota de Performance
Para melhorar o desempenho do emulador durante os testes, pode ser útil:
- aumentar a RAM alocada (por exemplo 2-3GB);
- aumentar o número de CPU cores (idealmente 4 cores);
- usar aceleração gráfica em modo Hardware (evitar Automático ou Software uma vez que afetam claramente o desempenho).

## Utilização de GenAI ao longo do processo
Durante o desenvolvimento e preparação dos acceptance tests, a GenAI foi utilizada para:
- Procurar o melhor framework de testing para React Native, resultando na escolha do Maestro.
- **Prompt utilizado**
 ````
 What tools are used for acceptance testing in react native, like for example Selenium or Patrol for Flutter?
 ````
 - Sugestão da possível solução para o problema de build, ao não encontrar os ficheiros do Android SDK.
- **Prompt utilizado**
````
Simplesmente foi copiada a mensagem de erro, diretamente do terminal.
````
- Compreender como a performance do emulador poderia ser melhorada, garantindo uma experiência de desenvolvimento e utilização mais fluida e agradável.
```` 
How to improve the Android emulator performance?
````

## Conclusão
A utilização do Maestro Studio Desktop para os acceptance tests em React Native mostrou-se eficaz, permitindo simular interações reais do utilizador e validar o comportamento da aplicação. A integração com o processo de build e a configuração adequada do ambiente de desenvolvimento foram essenciais para garantir a fiabilidade dos testes. A GenAI desempenhou um papel importante na resolução de problemas e na otimização do processo, demonstrando ser uma ferramenta valiosa, desde que usada de forma criteriosa e consciente.  


## Links para commits e branch
- Commit do acceptance test: [Commit Link](https://github.com/LEIC-ES-2025-26-2LEIC13/T1/commit/674db3d0610650ad9ec89b3d8227a8d378fec998)
- Branch do TPC3: [Branch Link](https://github.com/LEIC-ES-2025-26-2LEIC13/T1/tree/pedropires-tpc3)