const fs = require('fs');

const filePath = 'app/stories/[id]/share/page.tsx';
let content = fs.readFileSync(filePath, 'utf8');

// Fix 1: Add missing </div> after visible card avatar inner closes
// The pattern is: </div> followed by blank line then {/* Player Name */}
content = content.replace(
  /              <\/div>\n\n        \{\/\* Player Name \*\/\}/g,
  '              </div>\n          </div>\n\n        {/* Player Name */}'
);

// Fix 2: Add missing </div> to close visible card before hidden capture card
// Pattern: </div> (Share CTA closing) followed by blank line then {/* HIDDEN CAPTURE CARD */}
content = content.replace(
  /          <\/p>\n        <\/div>\n\n      \{\/\* HIDDEN CAPTURE CARD/g,
  '          </p>\n        </div>\n      </div>\n\n      {/* HIDDEN CAPTURE CARD'
);

// Fix 3: Add missing </div> after hidden card avatar inner closes
// Pattern: </div> (avatar inner) followed by blank line then {/* Player Name — no textShadow */}
content = content.replace(
  /                <\/div>\n              \)\}\n            <\/div>\n\n          \{\/\* Player Name — no textShadow \*\/\}/g,
  '                </div>\n              )}\n            </div>\n          </div>\n\n          {/* Player Name — no textShadow */}'
);

// Fix 4: Fix the end of file - add missing closing divs
// Current end: </div>\n    </div>\n  )\n}
// Should be: </div>\n      </div>\n    </div>\n  )\n}
content = content.replace(
  /          <\/p>\n        <\/div>\n    <\/div>\n  \)\n\}$/,
  '          </p>\n        </div>\n      </div>\n    </div>\n  )\n}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('File fixed successfully!');
