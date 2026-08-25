/**
 * Traduit une erreur d'upload (UploadThing) en message clair et rassurant
 * pour une utilisatrice non technique. On NE montre jamais le message brut du
 * SDK (ex. « Invalid token. A token is a base64 encoded JSON object matching
 * { apiKey: string, appId: string, regions: string[] } ») : c'est illisible et
 * anxiogène. Le détail technique reste loggé en console pour l'équipe.
 */
export function friendlyUploadError(err: unknown): string {
  const raw =
    err instanceof Error ? err.message : typeof err === "string" ? err : "";
  const m = raw.toLowerCase();

  // Mauvaise config serveur (token UploadThing absent/invalide) → ce n'est pas
  // la faute de l'utilisatrice : on l'oriente vers le support.
  if (m.includes("token") || m.includes("regions") || m.includes("apikey") || m.includes("appid")) {
    return "L'ajout de photos est momentanément indisponible. Réessayez dans quelques minutes ou contactez le support.";
  }
  if (m.includes("non authentifi") || m.includes("unauthorized") || m.includes("401")) {
    return "Votre session a expiré. Reconnectez-vous puis réessayez.";
  }
  if (m.includes("limite")) {
    // Messages « Limite d'upload atteinte » déjà lisibles côté serveur.
    return raw;
  }
  if (m.includes("filesize") || m.includes("too large") || m.includes("size") || m.includes("mo")) {
    return "Fichier trop lourd. Réduisez la taille (photos : 8 Mo max, vidéos : 64 Mo max) puis réessayez.";
  }
  if (m.includes("filetype") || m.includes("type") || m.includes("mime")) {
    return "Format de fichier non accepté. Utilisez une image JPG/PNG (ou une vidéo MP4/MOV/WEBM).";
  }
  if (m.includes("network") || m.includes("fetch") || m.includes("timeout")) {
    return "Connexion interrompue pendant l'envoi. Vérifiez votre réseau et réessayez.";
  }
  return "L'envoi a échoué. Réessayez, et si le problème persiste contactez le support.";
}
