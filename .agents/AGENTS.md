# System Rules

## Execution & Reporting
- Execute tasks completely in one session (end-to-end) without breaking for reviews or plans, unless explicitly required.
- Do not stop for confirmation of small steps. 
- Only pause and ask the user if a manual action is strictly required (e.g., executing SQL in a database dashboard, API keys, admin permissions).
- Always verify changes via automated scripts or local tests before reporting.
- Present only the final report and result to the user. Maximize automation, minimize back-and-forth.

## Phase Implementation Process
Har phase ko step-by-step complete karo:

Step 1:
- Pehle current architecture aur existing code ko analyze karo.
- Samjho ke existing features kaise kaam kar rahe hain.
- Bina zarurat existing files ya structure ko change mat karo.

Step 2:
- Phase ke required tasks ko clear breakdown me divide karo.
- Frontend, backend, database aur integrations ko proper order me implement karo.
- Ek time par ek major component complete karo.

Step 3:
- Har implemented feature ke baad verify karo ke wo correctly work kar raha hai.
- Errors ko ignore mat karo.
- Temporary ya incomplete solutions use mat karo.

Step 4:
- Phase complete hone se pehle:
  - npm run build run karo.
  - TypeScript errors fix karo.
  - Runtime errors fix karo.
  - Existing functionality check karo.
  - End-to-end testing perform karo.

## Bug Prevention Rules
- Koi bhi naya feature add karte waqt existing features break nahi hone chahiye.
- Regression introduce nahi karni.
- Unnecessary refactoring avoid karo.
- Sirf required files modify karo.
- Clean aur maintainable code likho.
- Proper error handling implement karo.
- Security best practices follow karo.

## Quality Standards
Har implementation:
- Production-ready honi chahiye.
- Strict TypeScript standards follow kare.
- Responsive honi chahiye.
- Scalable architecture follow kare.
- Future features add karna easy ho.

## Testing Requirement
Har phase ke end par verify karo:
✅ Feature functionality  
✅ Database operations  
✅ API responses  
✅ UI behavior  
✅ Authentication impact  
✅ Build success  
✅ TypeScript verification  
✅ End-to-End testing  

Agar koi issue mile to usi phase me fix karo.

## Phase Completion Rule
Kisi bhi phase ko complete tab declare karna jab:
- Saare planned tasks complete hon.
- Testing successful ho.
- Build successful ho.
- Koi known bug remaining na ho.
- Existing phases break na hue hon.
Next phase par tabhi move karna jab previous phase 100% verified complete ho.

## Final Report Har Phase Ke Baad
Phase complete hone ke baad provide karo:
1. Implemented features list
2. Modified files list
3. Database/API changes
4. Testing results
5. Build verification result
6. Remaining issues (agar koi hon)

Important: Assumptions mat lena. Agar koi dependency ya configuration required ho to properly configure karo. Incomplete implementation ke sath phase complete declare mat karna.
