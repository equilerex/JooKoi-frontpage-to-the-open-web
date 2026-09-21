import {
  LIBRARY_DOC_LOADERS,
  LIBRARY_DOCS,
  LIBRARY_FOLDERS,
  LIBRARY_ROOT,
  LibraryDocMeta,
  LibraryFolderMeta,
} from './library-index.generated';

/** Hand-written (not generated, see the generator's header comment): builds
 *  Map lookups over the generated data so pages don't linear-scan on every
 *  navigation. */
const docsByPath = new Map<string, LibraryDocMeta>(LIBRARY_DOCS.map((d) => [d.path, d]));
const foldersByPath = new Map<string, LibraryFolderMeta>(LIBRARY_FOLDERS.map((f) => [f.path, f]));
foldersByPath.set('', LIBRARY_ROOT);

export function findLibraryDoc(path: string): LibraryDocMeta | undefined {
  return docsByPath.get(path);
}

export function findLibraryFolder(path: string): LibraryFolderMeta | undefined {
  return foldersByPath.get(path);
}

export function loadLibraryDocHtml(path: string): Promise<string> {
  const loader = LIBRARY_DOC_LOADERS[path];
  if (!loader) return Promise.reject(new Error(`No content for library doc: ${path}`));
  return loader().then((m) => m.HTML);
}
