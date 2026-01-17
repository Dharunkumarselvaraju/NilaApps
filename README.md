# LearnTrack - Learning Analytics Dashboard

A comprehensive single-page web dashboard for a training academy that displays key KPIs and charts for learner performance. Built with Angular 19, TypeScript, and custom CSS.

## Features

- **📊 Interactive Dashboard**: Real-time visualization of learning analytics
- **🌓 Dark/Light Theme**: Toggle between themes with localStorage persistence
- **📱 Responsive Design**: Works on desktop, tablet, and mobile devices
- **🔍 Data Filtering**: Filter by district and switch between yearly datasets
- **📈 Multiple Chart Types**: Bar charts, donut charts, pie charts, and progress bars

## Dashboard Sections

1. **Summary KPI Cards**: Total learners, male/female breakdown, active and engaged learners
2. **Course Progress Rate**: District-wise progress breakdown (Below/Average/Good)
3. **Pass Percentage**: Horizontal bar chart showing assessment statistics
4. **Assessment Completion**: Donut chart showing completion rates
5. **Grade Breakdown**: Pie chart displaying grade distribution (A-E)
6. **District Ranking**: Sortable ranking with demographic breakdowns

## Tech Stack

- **Frontend**: Angular 19 with TypeScript
- **Styling**: SCSS with CSS Custom Properties for theming
- **Charts**: Custom SVG-based charts (no external chart libraries)
- **HTTP Client**: Angular HTTP Client for data fetching
- **State Management**: RxJS BehaviorSubjects for filter state
- **Build**: Client-side only (no SSR)

## Development server

To start a local development server, run:

```bash
npm start
# or
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
