# Acceptance Testing

## Setup
Após ter inicializado o projeto e da feature a ser testada estar implementada, o próximo passo é criar os acceptance tests.
Para criar os acceptance tests, que essencialmente tornam o teste de utilização automatizado, facilitando o desenvolvimento do projeto de software, decidiu-se usar a ferramenta Maestro, na sua versão Studio Desktop, um framework de automação de UI testing de modo a garantir a fiabilidade da aplicação a ser testada. Opera como um black-box testing framework, simulando interações do utilizador ao nível do dispositivo, sem ter acesso ao source code ou internal API's.


## Processo de Build

Primeiramente inicializar o diretório responsável pela build do projeto, usando o comando:
````
npx expo run:android
````

Ao efetuar uma build local da aplicação, para permitir a execução dos acceptance tests, é necessário garantir que os ficheiros do Android SDK são acesíveis, neste caso foi necessário criar um ficheiro local.properties na pasta android do projeto, com o seguinte conteúdo.
Caso ocorra um erro com SDK location not found, efetuar este passo.

````
sdk.dir=C\:\\Users\\<username>\\AppData\\Local\\Android\\Sdk
````
Substituindo <username> pelo nome do utilizador do sistema operativo, para garantir que o caminho para o Android SDK é correto e a build pode ser efetuada com sucesso.

De seguida prosseguir com o restante processo de build até estar completa.

## Execução dos Acceptance Tests
Após ter concluido a build, tendo o emulador Android em execução em segundo plano, o apk resultante da build será instalado neste.
NOTA: Para obter melhor performance na execução do emulador pode ser útil aumentar a RAM alocada para o mesmo e o número de CPU cores e efetuar graphics acceleration usando o modo Hardware.

No Maestro Studio Desktop, inicializar um novo projeto dentro do diretório do projeto e depois criar um novo teste (documento .yaml) e associá-lo à aplicação (neste caso com.leico).
Finalmente basta pensar como deveria ser o fluxo de execução da aplicação e escrever o teste de acordo com a especificação desejada e depois executá-lo, verificando se o resultado é o esperado.