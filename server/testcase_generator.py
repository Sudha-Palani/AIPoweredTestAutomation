import sys
import os
from dotenv import load_dotenv
from crewai import Agent, Task, Crew
from langchain_openai import ChatOpenAI
from docx import Document
import json

# Load environment variables
load_dotenv()

OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')
if not OPENAI_API_KEY:
    raise ValueError("OPENAI_API_KEY is missing. Ensure it is set in the environment or .env file.")

class TestCaseGenerationCrew:
    def __init__(self, requirements_text):
        """Initialize the Test Case Generation Crew using GPT as the LLM."""
        self.requirements_text = requirements_text
        self.llm = ChatOpenAI(
            api_key=OPENAI_API_KEY,
            model="gpt-4-turbo",
            temperature=0.1
        )

    def create_requirements_analyzer(self):
        return Agent(
            role='Requirements Analyst',
            goal='To analyze the provided software requirements document, extract functional, non-functional, and edge-case scenarios, and provide a detailed structured output for test case creation.',
            backstory='''You are a senior Requirements Analyst with 15+ years of experience in documenting and analyzing complex software requirements. Your expertise includes identifying edge cases, non-functional requirements, and hidden constraints. You deliver clear, actionable, and detailed analyses that developers and testers can directly use.''',
            verbose=True,
            llm=self.llm
        )

    def create_test_case_generator(self):
        return Agent(
            role='Test Case Engineer',
            goal='To generate highly detailed, requirement-specific test cases based on the analyzed requirements, ensuring coverage for functional, non-functional, boundary, and edge scenarios.',
            backstory='''You are a senior Test Case Engineer specializing in creating test cases for complex systems. You ensure that the test cases are actionable, specific, and provide exhaustive coverage of requirements. Your output includes all relevant details to ensure test reproducibility and accuracy.''',
            verbose=True,
            llm=self.llm
        )

    def generate_test_cases(self):
        """Generate test cases using CrewAI."""
        # Create agents
        requirements_analyzer = self.create_requirements_analyzer()
        test_case_generator = self.create_test_case_generator()

        # Define tasks
        analyze_requirements_task = Task(
            description=f"""Thoroughly analyze the following software requirements document:
{self.requirements_text}

Extract:
1. Functional Requirements
2. Non-functional Requirements (e.g., performance, security, scalability)
3. Key User Scenarios
4. Boundary and Edge Cases
5. Constraints and Assumptions

Output the analysis in a detailed, structured format suitable for test case creation.""",
            agent=requirements_analyzer,
            output_file='requirements_analysis.md',
            expected_output="A detailed analysis of the requirements document including functional, non-functional requirements, scenarios, edge cases, and constraints."
        )

        generate_test_cases_task = Task(
            description="""Using the following requirements analysis:
[IMPORT ANALYSIS OUTPUT]

Generate detailed and requirement-specific test cases covering:
1. Functional Requirements: Include all scenarios based on the provided functional requirements.
2. Non-functional Requirements: Include test cases for performance, scalability, security, etc.
3. Boundary Cases: Ensure edge conditions (e.g., limits of input fields) are covered.
4. Error Handling: Include negative test cases for invalid inputs and system error scenarios.

Each test case should include:
- Test Case ID: Unique identifier
- Requirement Reference: Requirement from the analysis
- Test Objective: What the test verifies
- Preconditions: Required setup
- Test Data: Inputs, including valid and invalid data
- Test Steps: Step-by-step execution
- Expected Results: Outcomes for each step
- Pass/Fail Criteria: How success is defined
- Priority: High/Medium/Low
- Test Type: Functional, Non-functional, Integration, etc.
- Notes: Additional details, risks, or considerations

Provide exhaustive test cases for all analyzed requirements, ensuring full coverage.""",
            agent=test_case_generator,
            dependencies=["requirements_analysis.md"],
            output_file='detailed_functional_test_cases.md',
            expected_output="A comprehensive set of detailed test cases covering all functional and non-functional requirements, with complete test steps and criteria."
        )

        # Create crew
        crew = Crew(
            agents=[requirements_analyzer, test_case_generator],
            tasks=[analyze_requirements_task, generate_test_cases_task],
            verbose=True
        )

        # Execute the workflow
        result = crew.kickoff()
        return result

    @staticmethod
    def export_to_word(test_cases, output_file="Generated_Test_Cases.docx"):
        """Export test cases to a Word document."""
        doc = Document()
        doc.add_heading('Generated Test Cases', level=1)

        for line in test_cases.split("\n\n"):
            if "Test Case ID:" in line:
                doc.add_heading(line, level=2)
            else:
                doc.add_paragraph(line)

        doc.save(output_file)
        return output_file

def main(file_path):
    try:
        # Read the document
        doc = Document(file_path)
        requirements_content = "\n".join([para.text for para in doc.paragraphs])

        # Initialize the crew
        crew = TestCaseGenerationCrew(requirements_content)
        test_cases = crew.generate_test_cases()
        
        # Export to Word document
        word_file = crew.export_to_word(str(test_cases))
        
        # Return both the test cases and the file path
        result = {
            'testCases': str(test_cases),
            'wordFilePath': word_file
        }
        
        print(json.dumps(result))
        return 0
    except Exception as e:
        print(json.dumps({'error': str(e)}), file=sys.stderr)
        return 1

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python test_case_generator.py <file_path>")
        sys.exit(1)
    sys.exit(main(sys.argv[1]))