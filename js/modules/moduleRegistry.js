const modules = [];

export function registerModule(definition) {
  modules.push(definition);
}

export function getModules() {
  return [...modules];
}
