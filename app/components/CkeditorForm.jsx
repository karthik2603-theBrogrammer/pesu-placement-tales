import "@blocknote/core/fonts/inter.css";
import { useCreateBlockNote } from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/mantine/style.css";
import { ChangeEvent, useCallback, useEffect, useState } from "react";



export default function App({ remarkState, setRemarkState }) {
    // Creates a new editor instance.
    const editor = useCreateBlockNote();
    const initialMarkdown = `
  ## **Interview and Offer Details at {your company name}!**

  ### Opportunity Source
  - **Was it on campus or off campus?** (Mark with a ✅ emoji)
    - On campus 
    - Off campus 
  
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
        <div className="wrapper w-[100%] my-9 gap-y-6">
            <div>Use this markdown editor to fill your experience:</div>
            <div className="item bordered">
                <code className="h-[1000px]">
                    <textarea
                        style={{
                            height: 400
                        }}
                        defaultValue={initialMarkdown}
                        onChange={markdownInputChanged}
                        className='w-full h-[1200px] resize-none'
                    />
                </code>
            </div>
            <div>Rendered Output:</div>
            <div className="item">
                <BlockNoteView editor={editor} editable={false} />
            </div>
        </div>

    );
}
