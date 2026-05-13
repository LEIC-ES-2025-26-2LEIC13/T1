# Sprint 2 AI Usage

## Tests

* GitHub Copilot and Perplexity were used to help write new tests and correct existing ones, inside the `__tests__/` directory.
* The tests were reviewed and modified, if necessary, by the team.

## Logic

* GitHub Copilot was used to help develop some logic for some features implemented during this sprint, especially in more complex scenarios, where several source files were involved and information had to be passed between components.
* IA use also helped develop the database logic, essentially taking the role of a "bug detector", by pointing out potential issues in the code develop by the team, and suggesting improvements.
  * Example of prompt used to help correct database logic specifically for task deletion:

  ```text
  Review all database logic of deletions and creations and search for inconsistencies in the deletion of tasks, specially. Take into consideration the structure of the database used, which is described in the sprint2improvements.md file. Additionaly review the  global database logic and search for bugs in the services files. Review thouroughly and point out real errors.
  ```

## UI elements

* GitHub Copilot was used to help develop the UI for some components, such as AnimatedPressable and ThemedAlert.
  * Example of prompt used to create the ThemedAlert component:

  ```text
  Make a custom themed Alert message popup, that behaves like a normal Alert but it has custom themed styling. Create a component called ThemedAlert.jsx inside the components folder to do this. Only use colors from the Colors.js pallete, inspire youself in the LoadingScreen component and reuse as much as possible the styling code already existent in the project.
  ```

## Bug fixing

* Perplexity was used to help fix bugs related to project dependencies and testing, by suggesting potential causes for the bugs and possible solutions to fix them.
