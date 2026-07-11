import { useState } from "react";
import Editor from "@monaco-editor/react";

const LANGUAGES = [
  { id: "javascript", label: "JavaScript" },
  { id: "python", label: "Python" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
] as const;

const STARTER_CODE: Record<string, string> = {
  javascript: "function solve() {\n  \n}\n",
  python: "def solve():\n    pass\n",
  cpp: "#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n\n}\n",
  java: "class Solution {\n    void solve() {\n\n    }\n}\n",
};

function CodeSubmitPanel() {
  const [language, setLanguage] = useState<string>("javascript");
  const [code, setCode] = useState<string>(STARTER_CODE.javascript);

  const handleLanguageChange = (newLanguage: string) => {
    setLanguage(newLanguage);
    setCode(STARTER_CODE[newLanguage]);
  };

  const handleSubmit = () => {
    console.log("Submitted code:", code);
    console.log("Selected language:", language);
  };

  return (
    <div>
      <label htmlFor="language-select">Language: </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => handleLanguageChange(e.target.value)}
      >
        {LANGUAGES.map((lang) => (
          <option key={lang.id} value={lang.id}>
            {lang.label}
          </option>
        ))}
      </select>
      <Editor
        height="300px"
        language={language}
        value={code}
        onChange={(value) => setCode(value ?? "")}
      />
      <button type="button" onClick={handleSubmit}>
        Submit
      </button>
    </div>
  );
}

export default CodeSubmitPanel;
