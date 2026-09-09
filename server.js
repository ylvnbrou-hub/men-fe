const http = require("http");
const fs = require("fs");
const path = require("path");

const fichierCommandes = path.join(
    __dirname,
    "commandes.json"
);

const serveur = http.createServer((requete, reponse) => {

    /* =========================
       AUTORISER LE FRONTEND
    ========================= */

    reponse.setHeader(
        "Access-Control-Allow-Origin",
        "*"
    );

    reponse.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, OPTIONS"
    );

    reponse.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type"
    );

    /* =========================
       REQUÊTE OPTIONS
    ========================= */

    if (requete.method === "OPTIONS") {

        reponse.writeHead(204);

        reponse.end();

        return;
    }


   /* =========================
   AFFICHER LE SITE MEN FÊ
========================= */

if (
    requete.method === "GET" &&
    requete.url === "/"
) {

    const fichierAccueil = path.join(
        __dirname,
        "..",
        "index.html"
    );

    fs.readFile(
        fichierAccueil,
        "utf8",
        (erreur, contenu) => {

            if (erreur) {

                reponse.writeHead(500, {
                    "Content-Type":
                        "text/plain; charset=utf-8"
                });

                reponse.end(
                    "Erreur : index.html introuvable."
                );

                return;
            }

            reponse.writeHead(200, {
                "Content-Type":
                    "text/html; charset=utf-8"
            });

            reponse.end(contenu);

        }
    );

    return;
}
    /* =========================
       AJOUTER UNE COMMANDE
    ========================= */

    if (
        requete.method === "POST" &&
        requete.url === "/commande"
    ) {

        let donnees = "";

        requete.on(
            "data",
            (bloc) => {
                donnees += bloc;
            }
        );

        requete.on(
            "end",
            () => {

                try {

                    const commande =
                        JSON.parse(donnees);


                    /* Lire les commandes existantes */

                    let commandes = [];

                    try {

                        commandes =
                            JSON.parse(
                                fs.readFileSync(
                                    fichierCommandes,
                                    "utf8"
                                )
                            );

                    } catch (erreur) {

                        commandes = [];

                    }


                    /* Ajouter la commande */

                    commandes.push(
                        commande
                    );


                    /* Sauvegarder */

                    fs.writeFileSync(
                        fichierCommandes,
                        JSON.stringify(
                            commandes,
                            null,
                            2
                        ),
                        "utf8"
                    );


                    console.log(
                        "📦 Nouvelle commande enregistrée !"
                    );


                    reponse.writeHead(
                        200,
                        {
                            "Content-Type":
                                "application/json; charset=utf-8"
                        }
                    );

                    reponse.end(
                        JSON.stringify({
                            succes: true,
                            message:
                                "Commande reçue par MEN FÊ !",
                            commande:
                                commande
                        })
                    );

                } catch (erreur) {

                    console.error(
                        erreur
                    );

                    reponse.writeHead(
                        400,
                        {
                            "Content-Type":
                                "application/json; charset=utf-8"
                        }
                    );

                    reponse.end(
                        JSON.stringify({
                            succes: false,
                            message:
                                "Commande invalide."
                        })
                    );
                }

            }
        );

        return;
    }


    /* =========================
       AFFICHER LES COMMANDES
    ========================= */

    if (
        requete.method === "GET" &&
        requete.url === "/commandes"
    ) {

        let commandes = [];

        try {

            commandes =
                JSON.parse(
                    fs.readFileSync(
                        fichierCommandes,
                        "utf8"
                    )
                );

        } catch (erreur) {

            commandes = [];

        }


        reponse.writeHead(
            200,
            {
                "Content-Type":
                    "application/json; charset=utf-8"
            }
        );

        reponse.end(
            JSON.stringify(
                commandes
            )
        );

        return;
    }


    /* =========================
       MODIFIER LE STATUT
    ========================= */

    if (
        requete.method === "PUT" &&
        requete.url.startsWith(
            "/commande/"
        )
    ) {

        let donnees = "";

        requete.on(
            "data",
            (bloc) => {
                donnees += bloc;
            }
        );

        requete.on(
            "end",
            () => {

                try {

                    const numeroCommande =
                        decodeURIComponent(
                            requete.url.split(
                                "/"
                            )[2]
                        );


                    const donneesRecues =
                        JSON.parse(
                            donnees
                        );


                    /* Lire les commandes */

                    let commandes =
                        JSON.parse(
                            fs.readFileSync(
                                fichierCommandes,
                                "utf8"
                            )
                        );


                    /* Chercher la commande */

                    const commande =
                        commandes.find(
                            function(c) {

                                return (
                                    c.numero ===
                                    numeroCommande
                                );

                            }
                        );


                    /* Commande introuvable */

                    if (!commande) {

                        reponse.writeHead(
                            404,
                            {
                                "Content-Type":
                                    "application/json; charset=utf-8"
                            }
                        );

                        reponse.end(
                            JSON.stringify({
                                succes: false,
                                message:
                                    "Commande introuvable."
                            })
                        );

                        return;
                    }


                    /* Modifier le statut */

                    commande.statut =
                        donneesRecues.statut;


                    /* Sauvegarder */

                    fs.writeFileSync(
                        fichierCommandes,
                        JSON.stringify(
                            commandes,
                            null,
                            2
                        ),
                        "utf8"
                    );


                    console.log(
                        "📦 Statut modifié :",
                        numeroCommande,
                        "→",
                        commande.statut
                    );


                    /* Réponse */

                    reponse.writeHead(
                        200,
                        {
                            "Content-Type":
                                "application/json; charset=utf-8"
                        }
                    );

                    reponse.end(
                        JSON.stringify({
                            succes: true,
                            message:
                                "Statut mis à jour."
                        })
                    );


                } catch (erreur) {

                    console.error(
                        erreur
                    );

                    reponse.writeHead(
                        400,
                        {
                            "Content-Type":
                                "application/json; charset=utf-8"
                        }
                    );

                    reponse.end(
                        JSON.stringify({
                            succes: false,
                            message:
                                "Erreur lors de la modification."
                        })
                    );
                }

            }
        );

        return;
    }

/* =========================
   AFFICHER LES FICHIERS DU SITE
========================= */

if (requete.method === "GET") {

    try {

        const urlSansParametres =
            decodeURIComponent(
                requete.url.split("?")[0]
            );

        const fichierDemande =
            urlSansParametres === "/"
                ? "/index.html"
                : urlSansParametres;

        const dossierProjet =
            path.normalize(
                path.join(__dirname, "..")
            );

        const cheminFichier =
            path.normalize(
                path.join(
                    dossierProjet,
                    fichierDemande
                )
            );

        if (
            cheminFichier !== dossierProjet &&
            !cheminFichier.startsWith(
                dossierProjet + path.sep
            )
        ) {

            reponse.writeHead(403);
            reponse.end("Accès interdit.");
            return;
        }

        if (!fs.existsSync(cheminFichier)) {
            return;
        }

        const extension =
            path.extname(cheminFichier)
                .toLowerCase();

        const types = {

            ".html":
                "text/html; charset=utf-8",

            ".css":
                "text/css; charset=utf-8",

            ".js":
                "application/javascript; charset=utf-8",

            ".json":
                "application/json; charset=utf-8",

            ".jpg":
                "image/jpeg",

            ".jpeg":
                "image/jpeg",

            ".png":
                "image/png",

            ".gif":
                "image/gif",

            ".webp":
                "image/webp",

            ".svg":
                "image/svg+xml",

            ".ico":
                "image/x-icon"
        };

        const type =
            types[extension] ||
            "application/octet-stream";

        reponse.writeHead(200, {
            "Content-Type": type
        });

        fs.createReadStream(
            cheminFichier
        ).pipe(reponse);

        return;

    } catch (erreur) {

        console.error(erreur);

        reponse.writeHead(500);
        reponse.end(
            "Erreur lors du chargement du fichier."
        );

        return;
    }
}
    /* =========================
       ROUTE INEXISTANTE
       ⚠️ TOUJOURS À LA FIN
    ========================= */

    reponse.writeHead(
        404,
        {
            "Content-Type":
                "application/json; charset=utf-8"
        }
    );

    reponse.end(
        JSON.stringify({
            message:
                "Route introuvable."
        })
    );

});


/* =========================
   LANCER LE SERVEUR
========================= */
const PORT = process.env.PORT || 3000;

serveur.listen(
    PORT,
    "0.0.0.0",
    () => {

        console.log(
            `🚀 Serveur MEN FÊ lancé sur le port ${PORT}`
        );

    }
);