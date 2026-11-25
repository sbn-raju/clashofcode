// Languages supported by the townhall executor (Judge0-compatible IDs).
// See townhall/src/languages/*.js. Every problem is stdin -> stdout.

const LANGUAGES = [
  {
    id: 71,
    key: "python",
    name: "Python 3",
    template: `import sys


def main():
    data = sys.stdin.read().split()
    # Parse the input above and print your answer to stdout.


if __name__ == "__main__":
    main()
`,
  },
  {
    id: 63,
    key: "javascript",
    name: "JavaScript (Node.js)",
    template: `const lines = require("fs").readFileSync(0, "utf8").split("\\n");

// Parse the input above and print your answer with console.log().
`,
  },
  {
    id: 74,
    key: "typescript",
    name: "TypeScript",
    template: `import * as fs from "fs";

const lines: string[] = fs.readFileSync(0, "utf8").split("\\n");

// Parse the input above and print your answer with console.log().
`,
  },
  {
    id: 62,
    key: "java",
    name: "Java 17",
    template: `import java.io.*;
import java.util.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // Parse input from br and print your answer to System.out.
    }
}
`,
  },
  {
    id: 54,
    key: "cpp",
    name: "C++17",
    template: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios::sync_with_stdio(false);
    cin.tie(nullptr);
    // Read input from cin and print your answer to cout.
    return 0;
}
`,
  },
  {
    id: 50,
    key: "c",
    name: "C",
    template: `#include <stdio.h>

int main(void) {
    // Read input with scanf and print your answer with printf.
    return 0;
}
`,
  },
];

const byId = new Map(LANGUAGES.map((l) => [l.id, l]));

module.exports = {
  LANGUAGES,
  LANGUAGE_IDS: LANGUAGES.map((l) => l.id),
  getLanguage: (id) => byId.get(Number(id)) || null,
};
