# Data Alchemist - AI Resource Allocation Configurator

Data Alchemist is a Next.js web application that helps users manage and configure resource allocation data. The application uses Google's Gemini AI to enhance the data management process, from validation to rule creation.

## Features

- **Data Ingestion**: Upload CSV or XLSX files for clients, workers, and tasks
- **Data Editing**: View and edit data in an interactive grid
- **Validation**: Run comprehensive validations to check for errors and warnings
- **AI-Powered Features**:
  - Intelligent data parsing with Gemini AI
  - Natural language search
  - Natural language data modification
  - AI-assisted rule creation
  - AI rule recommendations
  - Error correction suggestions
  - Deep AI validation
- **Rule Creation**: Create business rules to constrain resource allocation
- **Prioritization**: Set weights for different allocation criteria
- **Export**: Download cleaned data and rules in a structured format

## Tech Stack

- Next.js 14
- TypeScript
- Tailwind CSS
- Google Gemini AI
- React Table
- Chart.js
- React Dropzone
- XLSX and PapaParse for file parsing

## AI Features Implementation

The application uses Google's Gemini AI for several key features:

1. **Intelligent Data Parsing**: AI automatically maps column headers and normalizes data, even if headers are misnamed or in a different order.

2. **Natural Language Search**: Search for data using plain English queries, with Gemini interpreting the query and finding matching data.

3. **Natural Language Data Modification**: Modify data using plain language instructions like "Set all tasks in Development category to have duration of 3".

4. **Natural Language Rule Creation**: Define rules in plain English like "Tasks T001 and T002 must run together" and have AI convert them to formal rules.

5. **AI Rule Recommendations**: AI analyzes your data to identify patterns and suggest business rules that might improve resource allocation.

6. **AI-based Error Correction**: Get AI-suggested fixes for validation errors, with one-click application.

7. **AI Deep Validation**: Beyond basic checks, AI identifies complex issues like circular dependencies, resource bottlenecks, and allocation conflicts.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm or yarn
- Google Gemini API Key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/dhanyabad11/data-alchemist.git
   cd data-alchemist