# Copywriting & Tone Standards

## 0. Ground Truth & Accuracy
- **Copy must be rewritten, but never invented.** Every piece of text in the interface (headlines, buttons, labels, helper text, tooltips, empty states, errors, toasts, meta titles and descriptions, alt text, placeholder text, onboarding, footers) must be rewritten so it reads like a real person wrote it.
- You may only write what is true. If you don't know what the product actually does, how a feature behaves, or what a number means, ask the user.
- If a line can't be rewritten without making up a fact, delete the line instead.

---

## B. Copy Audit: Unnatural Words & Sentences
Audit ALL text in the app, not only the obvious marketing copy. List each instance with file path, the exact current text, and why it fails. Flag:

### Hype and filler vocabulary
Unleash, elevate, seamless, supercharge, revolutionize, empower, game-changing, cutting-edge, next-generation, state-of-the-art, streamline, effortless, unlock, harness, leverage, dive in, delve, embark, journey, landscape, ecosystem, tapestry, robust, holistic, innovative, transformative, intuitive, powerful, smart, magical, "the future of," "take X to the next level," "say goodbye to," "whether you're X or Y," "in today's fast-paced world."

### Sentence patterns that sound machine-written
- "Not just X, but Y" and "More than just X"
- Lists of exactly three adjectives or benefits
- Rhetorical question headlines ("Ready to transform your workflow?")
- Headlines built as "Noun: Adjective Noun Verb" or a colon-split slogan
- Em dashes used as a rhythm device
- Abstract nouns with no specific meaning (solution, experience, workflow, insights, capabilities, synergy)
- Sentences that praise the product instead of saying what it does
- Parallel structure forced onto everything, every card having the same length and cadence
- Exclamation marks, Title Case On Every Heading, and ALL CAPS

### Content that means nothing
- Any sentence that could appear on any other product's website unchanged
- Claims with no evidence (fastest, most secure, loved by thousands)
- Helper text or tooltips that just repeat the label
- Lorem ipsum, "John Doe," "Acme Inc.," "example@email.com," fake phone numbers, fake testimonials, fake stats

---

## 2B. Copywriting Standard (Apple Interface Style)

Write the way a thoughtful person talks, in the style of Apple's own interface text: short, plain, specific, and calm.

### Rules
1. **Concrete descriptions**: Say what it is or what it does, using concrete words. "Track your assignments" beats "Streamline your academic workflow."
2. **Everyday language**: Use plain, everyday words. If a ten-year-old wouldn't say the word in conversation, find a simpler one.
3. **Short sentences**: One idea each. Cut every word that isn't doing work.
4. **Action-specific buttons**: Buttons start with a verb that describes the exact result: "Save," "Send invite," "Download PDF." Never "Submit," "Get started," or "Learn more" unless that is literally what happens.
5. **Factual headlines**: Headlines state a fact or a benefit in normal speech, not a slogan. No wordplay, no puns, no rhetorical questions.
6. **Sentence case & punctuation**: Sentence case everywhere. No exclamation marks. No emojis.
7. **Direct address**: Don't address the user with hype ("Let's get you set up!"). Be respectful and direct.
8. **Helpful errors**: Errors say what happened and what to do next, with no blame and no jargon: "Couldn't save. Check your connection and try again."
9. **Actionable empty states**: Empty states say what belongs here and how to add it, in one or two lines.
10. **Consistent vocabulary**: One name for each concept across the whole product. Don't call the same thing "project," "workspace," and "board."
11. **Natural cadence**: Vary sentence length and structure naturally. Not every card or section should have the same rhythm.
12. **Verified facts**: Numbers, claims, and names only if they are real and sourced from the product or from the user.

### Tests every string must pass
- **Read it out loud**: would a real person say this to another person?
- **Specificity**: does it tell the user something concrete? If it could appear on any other product, rewrite or delete it.
- **Deletion test**: if you remove this sentence, does the user lose any information? If not, delete it.
- **Truth**: is every claim something confirmed? If not, ask or remove it.

### Required Process
- Before rewriting, align on: what the product is in one plain sentence, who uses it, tone (e.g., calm and direct, a little warm), and any terms to keep/avoid.
- Produce a **Copy Review table** (artifact) with columns: `Location | Current text | New text | Reason`. Wait for user approval before applying copy changes.
- Mark any line that cannot be rewritten without more information as `NEEDS OWNER INPUT` instead of guessing.

---

## 4. Verification Sweep
- Run a final copy sweep across the whole app, including meta tags, alt text, aria-labels, error messages, and placeholder text.
- Report any string that still fails the four tests in Section 2B.
- Confirm that hype words and machine-written sentence patterns no longer appear anywhere in the UI, code comments, or commit messages.
