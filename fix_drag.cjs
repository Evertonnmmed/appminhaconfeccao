const fs = require('fs');

const file = 'd:/APP/minha_confe-o-main/minha_confe-o-main/src/App.tsx';
let source = fs.readFileSync(file, 'utf8');

// 1. Add import for useDragControls
source = source.replace(/import \{ motion, AnimatePresence, Reorder \} from 'motion\/react';/, "import { motion, AnimatePresence, Reorder, useDragControls } from 'motion/react';");

// 2. Add SortableItem component right before function ReportsView()
const sortableItemCode = `
function SortableItem({ value, renderContent }: { value: string, renderContent: (controls: any) => React.ReactNode }) {
  const controls = useDragControls();
  return (
    <Reorder.Item value={value} dragListener={false} dragControls={controls} className="relative group/reorder list-none bg-white rounded-2xl shadow-sm">
      {renderContent(controls)}
    </Reorder.Item>
  );
}
`;

if (!source.includes('function SortableItem')) {
    source = source.replace(/function ReportsView\(\) \{/, sortableItemCode + '\nfunction ReportsView() {');
}

// 3. Find the old Reorder.Group map loop and replace it
const startIndex = source.indexOf('<Reorder.Group');
const endIndexStr = '\n      </Reorder.Group>';
let endIndex = source.indexOf(endIndexStr, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
    endIndex += endIndexStr.length;

    const topPart = source.substring(0, startIndex);
    const bottomPart = source.substring(endIndex);

    let groupSrc = source.substring(startIndex, endIndex);

    // Replace the opening Reorder.Item with SortableItem
    groupSrc = groupSrc.replace(
        /\<Reorder\.Item key=\{section\} value=\{section\}.*?\>/g,
        '<SortableItem key={section} value={section} renderContent={(dragControls) => (\n<>'
    );

    // Replace the closing Reorder.Item
    groupSrc = groupSrc.replace(
        /\<\/Reorder\.Item\>/g,
        '</>\n)}\n/>'
    );

    // Provide default onPointerDown handlers for Grip where missing
    // In ReportsView, we had 'title="Arraste para reordenar"' on handles. Let's make sure it has dragControls.
    groupSrc = groupSrc.replace(
        /title="Arraste para reordenar"(?! onPointerDown)/g,
        'title="Arraste para reordenar" onPointerDown={(e) => dragControls.start(e)}'
    );

    fs.writeFileSync(file, topPart + groupSrc + bottomPart, 'utf8');
    console.log('Successfully applied dragControls to ReportsView.');
} else {
    console.error('Could not find Reorder.Group segment.');
}
