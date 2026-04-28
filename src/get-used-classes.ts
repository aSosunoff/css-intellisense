const processList = (
  classList: string,
  callback: (className: string) => void,
) => {
  for (const className of classList.trim().split(/\s+/).filter(Boolean)) {
    callback(className);
  }
};

export const getUsedClasses = (classList: string) => {
  const usedClasses = new Set<string>();

  processList(classList, (className) => {
    usedClasses.add(className);
  });

  for (const match of classList.matchAll(/["']([^"']+)["']/g)) {
    processList(match[1], (className) => {
      usedClasses.add(className);
    });
  }

  return usedClasses;
};
