const fs = require('fs');

const file = 'd:/APP/minha_confe-o-main/minha_confe-o-main/src/App.tsx';
let source = fs.readFileSync(file, 'utf8');

// 1. Remove Reorder and useDragControls from imports (if empty, just leave motion)
source = source.replace(/import \{ motion, AnimatePresence, Reorder, useDragControls \} from 'motion\/react';/, "import { motion, AnimatePresence } from 'motion/react';");
source = source.replace(/import \{ motion, AnimatePresence, Reorder \} from 'motion\/react';/, "import { motion, AnimatePresence } from 'motion/react';");

// Add ChevronUp and ChevronDown if not present
if (!source.includes('ChevronUp')) {
    source = source.replace(/GripVertical\n\} from 'lucide-react';/, "GripVertical,\n  ChevronUp,\n  ChevronDown\n} from 'lucide-react';");
}

// 2. Add handleMoveSection to ReportsView
const moveSectionCode = `
  const handleMoveSection = (index: number, direction: -1 | 1) => {
    const newOrder = [...sectionOrder];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= newOrder.length) return;
    
    // Swap
    [newOrder[index], newOrder[newIndex]] = [newOrder[newIndex], newOrder[index]];
    
    setSectionOrder(newOrder);
    localStorage.setItem('reportsSectionOrder', JSON.stringify(newOrder));
  };
`;

if (!source.includes('handleMoveSection =')) {
    source = source.replace(/const handleReorder[\s\S]*?};\n/, match => match + moveSectionCode);
}

// 3. Remove the entire SortableItem function
source = source.replace(/function SortableItem\([\s\S]*?\}\n\n/m, '');

// 4. Replace the Reorder.Group rendering block
const startIndex = source.indexOf('<Reorder.Group');
const endIndexStr = '\n      </Reorder.Group>';
let endIndex = source.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    endIndex += endIndexStr.length;

    const topPart = source.substring(0, startIndex);
    const bottomPart = source.substring(endIndex);

    let groupSrc = source.substring(startIndex, endIndex);

    // Swap <Reorder.Group ...> with <div className="space-y-6">
    groupSrc = groupSrc.replace(/\<Reorder\.Group axis="y" values=\{sectionOrder\} onReorder=\{handleReorder\} className="space-y-6"\>/, '<div className="space-y-6">');
    // Swap </Reorder.Group> with </div>
    groupSrc = groupSrc.replace(/\<\/Reorder\.Group\>/, '</div>');

    // Remove `<SortableItem ... renderContent={(dragControls) => (\n<>`
    groupSrc = groupSrc.replace(/\<SortableItem key=\{section\} value=\{section\} renderContent=\{\(dragControls\) =\> \(\n\<\>/g, '<div key={section} className="relative group/reorder print:break-inside-avoid">');

    // Remove `</>\n)}\n/>`
    groupSrc = groupSrc.replace(/\<\/\>\n\)\}\n\/\>/g, '</div>');

    // Define the UP/DOWN action controls 
    const actionButtons = `
      <div className="flex items-center gap-1 print:hidden">
        <button onClick={() => handleMoveSection(sectionOrder.indexOf(section), -1)} disabled={sectionOrder.indexOf(section) === 0} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors bg-slate-50 hover:bg-indigo-50 rounded" title="Mover para cima">
          <ChevronUp size={18} />
        </button>
        <button onClick={() => handleMoveSection(sectionOrder.indexOf(section), 1)} disabled={sectionOrder.indexOf(section) === sectionOrder.length - 1} className="p-1 text-slate-400 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-400 transition-colors bg-slate-50 hover:bg-indigo-50 rounded" title="Mover para baixo">
          <ChevronDown size={18} />
        </button>
      </div>
    `.trim().replace(/\n/g, '').replace(/\s+/g, ' ');

    // Replace the Grip action with Up/Down buttons
    // Grip Action inside Card looks like: action={<div className="text-slate-300 cursor-grab active:cursor-grabbing hover:text-indigo-500 transition-colors" title="Arraste para reordenar" onPointerDown={(e) => dragControls.start(e)}><GripVertical size={20} /></div>}
    // Note check for varying expressions.
    groupSrc = groupSrc.replace(/action=\{<div.*?<GripVertical size=\{20\} \/><\/div>\}/g, `action={<>${actionButtons}</>}`);

    // Replace the Grip inside Stats Section
    groupSrc = groupSrc.replace(/<div className="absolute -left-10.*?<GripVertical size=\{24\} \/>\s*<\/div>/sg, `<div className="absolute -left-16 top-1/2 -translate-y-1/2 opacity-0 group-hover/reorder:opacity-100 transition-all hidden xl:block z-10">${actionButtons}</div>`);

    fs.writeFileSync(file, topPart + groupSrc + bottomPart, 'utf8');
    console.log('Successfully replaced Reorder with Up/Down buttons!');
} else {
    console.error('Could not find Reorder.Group segment.');
}
