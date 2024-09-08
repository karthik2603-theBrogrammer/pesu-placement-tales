import "@blocknote/core/fonts/inter.css";
import {
  DragHandleButton,
  SideMenu,
  SideMenuController,
  useCreateBlockNote
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { ChangeEvent, useCallback, useEffect, useState } from "react";



export default function App({ remarkState, setRemarkState }) {
  // Creates a new editor instance.
  const editor = useCreateBlockNote();
  const [textareaStyle, setTextareaStyle] = useState({ height: '200px' });

  useEffect(() => {
    // Function to update textarea height based on screen width
    const updateTextareaHeight = () => {
      if (window.innerWidth <= 600) {
        setTextareaStyle({ height: '300px' });
      } else {
        setTextareaStyle({ height: '100%' });
      }
    };

    // Set initial height
    updateTextareaHeight();

    // Update height on window resize
    window.addEventListener('resize', updateTextareaHeight);

    // Clean up the event listener
    return () => {
      window.removeEventListener('resize', updateTextareaHeight);
    };
  }, []);
  const initialMarkdown = `
  ## **Interview and Offer Details at {Company}!**

  ### A Brief description about yourself :)
#### You may (not necessarily) answer all the below questions
  - What are your technical interests?
  - Your Branch/ CGPA/ Clubs, etc
  - Hobbies 
  ### Few Quick Questions
  - What is your view on DSA and Competitive programming? Is it completely necessary for placements ?
- Whats your view on the question "skills and projects or DSA".
- What CGPA is a good CGPA?



### Placement Opportunity Source
  - **Was it on campus or off campus?** (Mark with a ✅ emoji)
    - On campus 
    - Off Campus


  
  ### Interview Experience
  - **Briefly explain your interview experience.** 
    - **Round 1 (R1):** 
      - Description: 
      - Key Questions: 
      - Duration: 
      - Outcome: 
    - **Round 2 (R2):** 
      - Description: 
      - Key Questions: 
      - Duration: 
      - Outcome: 
    - **Round 3 (R3):** 
      - Description: 
      - Key Questions: 
      - Duration: 
      - Outcome: 
    - *(Add more rounds if applicable)*
  
  ### Compensation Details
  - Internship Stipend 
  - **Base Salary:** 
  - **Total CTC (Cost to Company):** 
  - **Breakdown:**
    - **Base Salary:** 
    - **Stocks:** 
    - **Bonuses:** 
    - **Allowances:** 
    - **Other Benefits:** 
  
  ### Key Dates
  - **Date of Company Arrival:** 
  - **Date of Online Test:** 
  - **Date of Interview:** 
  - **Date of Placement:** 
  
  ### Helpful Resources
  - **Resources that helped you crack this offer:** 
    - Books:
    - Websites:
    - Courses:
    - Practice Platforms:
    - Others:
  
  ### Remarks / Tips
  - **Free remarks/tips for the next batch:**
    - [Your advice here]
  
  ---
  
  Feel free to add any additional notes or information that you think might be helpful for others.
  
  `;

  const markdownInputChanged = useCallback(
    async (e) => {
      // Whenever the current Markdown content changes, converts it to an array of
      // Block objects and replaces the editor's content with them.
      setRemarkState(e.target.value)
      const blocks = await editor.tryParseMarkdownToBlocks(e.target.value);
      editor.replaceBlocks(editor.document, blocks);
    },
    [editor]
  );

  // For initialization; on mount, convert the initial Markdown to blocks and replace the default editor's content
  useEffect(() => {
    async function loadInitialHTML() {
      const blocks = await editor.tryParseMarkdownToBlocks(initialMarkdown);
      editor.replaceBlocks(editor.document, blocks);
    }
    loadInitialHTML();
  }, [editor]);

  // Renders a text area for you to write/paste Markdown in, and the editor instance
  // below, which displays the current Markdown as blocks.
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 w-[100%] my-9 gap-y-6 gap-x-2" >
      {/* <div>Use this markdown editor to fill your experience:</div> */}
      <div className="item bordered">
        <code className="">
          <textarea
            style={textareaStyle}
            defaultValue={initialMarkdown}
            onChange={markdownInputChanged}
            className='w-full  resize-none'
          />
        </code>
      </div>
      {/* <div>Rendered Output:</div> */}
      <div className="flex flex-col items-center justify-center">
        <p className="text-sm text-green-600">Rendered output 👀</p>
        <BlockNoteView editor={editor} editable={false} theme="light" >
          <SideMenuController
            sideMenu={(props) => (
              <SideMenu {...props}>
                {/* Button which removes the hovered block. */}
                {/* <RemoveBlockButton {...props} /> */}
                <DragHandleButton {...props} />
              </SideMenu>
            )}
          />
        </BlockNoteView >
      </div>
    </div>

  );
}