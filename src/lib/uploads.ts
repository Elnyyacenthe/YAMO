/**
 * UploadThing n'est activé que si un token est réellement présent.
 * En prod, un `UPLOADTHING_TOKEN` vide fait planter le SDK avec une erreur
 * technique (« Invalid token … regions: string[] ») renvoyée telle quelle au
 * navigateur. On détecte ici l'absence de token pour dégrader proprement :
 * l'uploader affiche un message clair au lieu de cette erreur.
 *
 * À n'utiliser que côté serveur (lit process.env, non exposé au client).
 */
export function uploadsEnabled(): boolean {
  return !!process.env.UPLOADTHING_TOKEN?.trim();
}
