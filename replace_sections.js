const fs = require('fs');

const file = 'd:/APP/minha_confe-o-main/minha_confe-o-main/src/App.tsx';
let source = fs.readFileSync(file, 'utf8');

// 1. Add state inside ReportsView
const stateCode = `  const [sectionOrder, setSectionOrder] = useState<string[]>(() => {
    const saved = localStorage.getItem('reportsSectionOrder');
    return saved ? JSON.parse(saved) : ['stats', 'finished', 'active', 'history'];
  });

  const handleReorder = (newOrder: string[]) => {
    setSectionOrder(newOrder);
    localStorage.setItem('reportsSectionOrder', JSON.stringify(newOrder));
  };
`;
source = source.replace("const [selectedBranch", stateCode + "\n  const [selectedBranch");

// 2. Extract sections
const parts = source.split(/<div className="grid grid-cols-1 md:grid-cols-3 gap-6">/);
const topPart = parts[0];
const middleParts = parts[1].split(/<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">/);
const statsBlock = `<div className="grid grid-cols-1 md:grid-cols-3 gap-6">` + middleParts[0];
const bottomParts = middleParts[1].split(/<Card title="Histórico de Apontamentos">/);
const gridContent = bottomParts[0];

// The gridContent has two Cards inside it. They are separated by:
//         </Card>
// 
//         <Card title="Ordens Ativas">
const gridCards = gridContent.split(/(?<=<\/Card>)\s*(?=<Card title="Ordens Ativas">)/);
let finishedBlock = gridCards[0].trim();
let activeBlock = gridCards[1].trim();

// Strip the ending </div> of the grid from activeBlock
activeBlock = activeBlock.replace(/\s*<\/div>\s*$/, '');

const historyContent = bottomParts[1];
// Find the end of the history Card
const historyEndIndex = historyContent.lastIndexOf('</Card>');
const historyBlock = `<Card title="Histórico de Apontamentos">` + historyContent.substring(0, historyEndIndex + 7);
const afterHistory = historyContent.substring(historyEndIndex + 7);

// Add the drag handle action to the Cards
function addActionToCard(cardHtml) {
    return cardHtml.replace(/<Card title="([^"]+)">/, '<Card title="$1" action={<div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-indigo-500 transition-colors" title="Arraste para reordenar"><GripVertical size={20} /></div>}>');
}

finishedBlock = addActionToCard(finishedBlock);
activeBlock = addActionToCard(activeBlock);
const newHistoryBlock = addActionToCard(historyBlock);

const newRenderCode = `
      <Reorder.Group axis="y" values={sectionOrder} onReorder={handleReorder} className="space-y-6">
        {sectionOrder.map((section) => (
          <Reorder.Item key={section} value={section} className="relative group/reorder list-none bg-white rounded-2xl shadow-sm">
            {section === 'stats' && (
              <div className="relative">
                <div className="absolute -left-10 top-1/2 -translate-y-1/2 opacity-0 group-hover/reorder:opacity-100 p-2 cursor-grab active:cursor-grabbing text-slate-300 hover:text-indigo-500 transition-all hidden xl:block z-10">
                  <GripVertical size={24} />
                </div>
                ${statsBlock.trim()}
              </div>
            )}
            {section === 'finished' && (
              ${finishedBlock}
            )}
            {section === 'active' && (
              ${activeBlock}
            )}
            {section === 'history' && (
              ${newHistoryBlock}
            )}
          </Reorder.Item>
        ))}
      </Reorder.Group>
`;

const finalSource = topPart + newRenderCode + afterHistory;
fs.writeFileSync(file, finalSource, 'utf8');
console.log('Successfully refactored ReportsView sections.');
