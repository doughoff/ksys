export const LINE_SIZE = 33;

export function formatString(start: string, end: string): string {
   const spaces = LINE_SIZE - start.length;
   let result = start;
   if (end.length <= spaces) {
      result += ' '.repeat(spaces - end.length) + end;
   } else {
      result += ' '.repeat(spaces);
   }
   return result ;
}

export function lineSeparator(character = '='): string {
   return character.repeat(LINE_SIZE) ;
}
