export type FamilleEnOrAnswer = {
  text: string;
  points: number;
};

export type FamilleEnOrQuestion = {
  question: string;
  answers: FamilleEnOrAnswer[]; // du plus au moins populaire
};

export const FAMILLE_EN_OR_QUESTIONS: FamilleEnOrQuestion[] = [
  {
    question: "Si on l'oubile en partant de chez soi, c'est la cata.",
    answers: [
      { text: "Clé", points: 27 },
      { text: "Téléphone", points: 26 },
      { text: "Eteindre le gaz", points: 16 },
      { text: "Portefeuille", points: 8 },
      { text: "Fermer la porte", points: 6 },
      { text: "Fermer les fenêtres", points: 5 },
      { text: "Son enfant", points: 3 },
    ],
  },
  {
    question: "Ques faites-vous pour attirer l'attention de quelqu'un qui vous plaît en soirée?",
    answers: [
      {text: "Lancer un regard/Clin d'oeil", points: 25},
      {text: "Offir un verre", points: 19},
      {text: "Sourire", points: 16},
      {text: "Danser devant ou avec lui/elle", points: 14},
      {text: "Faire des blagues", points: 8},
      {text: "Parler fort", points: 6},
      {text: "Feindre l'indifférence", points: 5},
    ]
  },
  {
    question: "Qu'est-ce que les Hommes n'osent pas faire en présence de leurs pote ?",
    answers: [
      {text: "Parler de leurs sentiments", points: 21},
      {text: "Pleurer", points: 18},
      {text: "Dire 'je t'aime'", points: 17},
      {text: "Etre tendre avec leur chérie", points: 12},
      {text: "Tâches ménagères", points: 8},
    ]
  },
  {
    question: "Citez quelque chose qui se passe de main en main.",
    answers: [
      { text: "Un joint", points: 34 },
      { text: "Un rhume", points: 23 },
      { text: "Une corbeille de quête", points: 12 },
      { text: "Une rumeur", points: 9 },
      { text: "Un bébé", points: 6 },
    ],
  },
  {
    question: "Citez quelque chose que les gens échangent.",
    answers: [
      { text: "Vêtements/Chaussures", points: 23 },
      { text: "Numéros de téléphone", points: 20 },
      { text: "Histoires/Ragots", points: 19 },
      { text: "Salive/Microbes", points: 14 },
      { text: "Livres", points: 11 },
      { text: "Recettes", points: 8 },
    ],
  },
  {
    question: "Citez quelque chose qui peut être gonflé ou dégonflé.",
    answers: [
      { text: "Ballon", points: 44 },
      { text: "Pneu", points: 25 },
      { text: "Ballon de plage", points: 10 },
      { text: "Ego", points: 7 },
      { text: "Radeau", points: 5 },
    ],
  },
  {
    question: "Citez un endroit où vous n'allez plus quand vous êtes fauché.",
    answers: [
      { text: "Restaurant", points: 32 },
      { text: "Magasin/Centre commercial", points: 16 },
      { text: "Bar/Boîte de nuit", points: 16 },
      { text: "Casino", points: 15 },
      { text: "Le cinéma", points: 8 },
      { text: "La banque", points: 4 },
      { text: "Hippodrome", points: 3 },
      { text: "Match de sport", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose qu'un médecin pourrait extraire d'une personne.",
    answers: [
      { text: "Une gerbille", points: 32 },
      { text: "Un bébé", points: 23 },
      { text: "Une tumeur", points: 15 },
      { text: "Une dent", points: 9 },
      { text: "Une balle", points: 7 },
    ],
  },
  {
    question: "Citez quelque chose dont les bonhommes de neige pourraient faire des cauchemars.",
    answers: [
      { text: "Soleil/Temps de plage", points: 62 },
      { text: "Feu/Lance-flammes", points: 14 },
      { text: "Sèche-cheveux", points: 3 },
      { text: "Pluie", points: 3 },
      { text: "Chasse-neige/Pelle", points: 3 },
      { text: "Sécheresse", points: 2 },
      { text: "Boules de neige", points: 2 },
      { text: "Chiens qui font pipi", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose qui pourrait être plein de trous.",
    answers: [
      { text: "Gruyère", points: 40 },
      { text: "Vêtements/Chaussettes", points: 16 },
      { text: "Alibi/Histoire", points: 14 },
      { text: "Filet de pêche", points: 9 },
      { text: "Passoire", points: 8 },
      { text: "Terrain de golf", points: 2 },
      { text: "Grillage", points: 2 },
      { text: "Route/Rue", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose qui commence par le mot 'CRÈME'.",
    answers: [
      { text: "Crème brûlée", points: 57 },
      { text: "Crème fraîche", points: 12 },
      { text: "Crème anglaise", points: 8 },
      { text: "Crème caramel", points: 8 },
      { text: "Crème pâtissière", points: 6 },
      { text: "Crème Chantilly", points: 6 },
    ],
  },
  {
    question: "Citez quelque chose que vous ne voulez pas que les gens vous demandent.",
    answers: [
      { text: "De l'argent/Des dons", points: 91 },
      { text: "Votre âge", points: 3 },
      { text: "Votre poids", points: 2 },
      { text: "Des conseils", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose que vous pourriez trouver dans une baignoire.",
    answers: [
      { text: "Eau", points: 44 },
      { text: "Savon", points: 25 },
      { text: "Canard en caoutchouc", points: 10 },
      { text: "Shampooing", points: 7 },
      { text: "Bulles", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose associé aux vampires.",
    answers: [
      { text: "Dents", points: 44 },
      { text: "Cape", points: 25 },
      { text: "Ail", points: 10 },
      { text: "Croix", points: 7 },
      { text: "Pieu", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose que vous verriez dehors qui vous ferait vouloir rester à l'intérieur.",
    answers: [
      { text: "Mauvais temps/Tornade", points: 71 },
      { text: "Ours/Animal", points: 13 },
      { text: "Zombies", points: 3 },
      { text: "Apocalypse", points: 2 },
      { text: "Feu/Fumée", points: 2 },
      { text: "Mauvaises célébrités", points: 2 },
    ],
  },
  {
    question: "Citez une raison pour laquelle une personne pourrait se réveiller à 2h du matin.",
    answers: [
      { text: "Envie d'aller aux toilettes", points: 44 },
      { text: "Soif", points: 25 },
      { text: "Faim", points: 10 },
      { text: "Cauchemar", points: 7 },
      { text: "Insomnie", points: 5 },
    ],
  },
  {
    question: "Complétez la phrase : Tenez le/la ____.",
    answers: [
      { text: "Téléphone", points: 26 },
      { text: "Porte", points: 14 },
      { text: "Mayo", points: 10 },
      { text: "Ascenseur", points: 9 },
    ],
  },
  {
    question: "Quand vous entendez un bruit venant de votre cave, qu'espérez-vous que ce ne soit pas ?",
    answers: [
      { text: "Une autre personne", points: 42 },
      { text: "Un fantôme/Monstre", points: 25 },
      { text: "Des animaux/Rats", points: 21 },
      { text: "Une inondation/Chauffe-eau", points: 10 },
    ],
  },
  {
    question: "Citez quelque chose qui a des dents.",
    answers: [
      { text: "Animaux", points: 66 },
      { text: "Les gens", points: 19 },
      { text: "Un peigne", points: 8 },
      { text: "Une fermeture éclair", points: 4 },
      { text: "Une scie", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose qui pourrait sortir de votre nez quand vous riez.",
    answers: [
      { text: "Morve", points: 48 },
      { text: "Lait", points: 32 },
      { text: "Eau", points: 5 },
      { text: "Soda", points: 4 },
      { text: "Souffle", points: 3 },
    ],
  },
  {
    question: "Citez une occasion pour laquelle vous pourriez porter votre sous-vêtement porte-bonheur.",
    answers: [
      { text: "Un rendez-vous galant", points: 30 },
      { text: "Un entretien d'embauche", points: 16 },
      { text: "Casino/Jeux", points: 11 },
      { text: "Un événement sportif", points: 9 },
      { text: "Mariage/Nuit de noces", points: 7 },
      { text: "Anniversaire", points: 5 },
      { text: "Saint-Valentin", points: 4 },
      { text: "Examen/Concours", points: 4 },
    ],
  },
  {
    question: "Complétez la phrase : Vous êtes dans la/le ____ profond(e).",
    answers: [
      { text: "Merde", points: 53 },
      { text: "Galère", points: 22 },
      { text: "Eau", points: 21 },
      { text: "Somnolence", points: 4 },
    ],
  },
  {
    question: "Citez un animal facile à imiter aux charades.",
    answers: [
      { text: "Singe", points: 32 },
      { text: "Chien", points: 21 },
      { text: "Chat", points: 16 },
      { text: "Oiseau", points: 14 },
      { text: "Éléphant", points: 4 },
      { text: "Kangourou", points: 4 },
      { text: "Lapin", points: 4 },
    ],
  },
  {
    question: "Qu'est-ce qui serait difficile à faire si vous mettiez accidentellement de la super glue à la place du rouge à lèvres ?",
    answers: [
      { text: "Manger", points: 32 },
      { text: "Parler", points: 32 },
      { text: "Embrasser", points: 25 },
      { text: "Respirer", points: 8 },
      { text: "L'enlever", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose que vous détesteriez qu'il se passe pendant que vous prenez un bain.",
    answers: [
      { text: "Le téléphone sonne", points: 35 },
      { text: "Plus d'eau chaude", points: 24 },
      { text: "La sonnette sonne", points: 8 },
      { text: "Être électrocuté", points: 6 },
      { text: "Panne de courant", points: 4 },
      { text: "Glisser/Tomber", points: 4 },
      { text: "Quelqu'un entre", points: 4 },
    ],
  },
  {
    question: "Après avoir enfin déplacé le canapé pour la première fois en dix ans, citez quelque chose que vous pourriez trouver dessous.",
    answers: [
      { text: "Argent/Monnaie", points: 52 },
      { text: "Poussière", points: 25 },
      { text: "Nourriture", points: 7 },
      { text: "Jouets", points: 5 },
      { text: "Télécommande", points: 4 },
      { text: "Vêtements/Chaussures", points: 4 },
    ],
  },
  {
    question: "Citez quelque chose que les gens changent régulièrement.",
    answers: [
      { text: "Vêtements", points: 85 },
      { text: "Chaîne de TV", points: 6 },
      { text: "Avis", points: 4 },
      { text: "Coiffure", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose que vous faites à votre nez.",
    answers: [
      { text: "Se moucher", points: 55 },
      { text: "Se curer", points: 27 },
      { text: "Se gratter/Se frotter", points: 9 },
      { text: "S'essuyer", points: 5 },
      { text: "Se percer", points: 2 },
    ],
  },
  {
    question: "Citez un endroit où les gens vont à la recherche du bonheur.",
    answers: [
      { text: "Vacances", points: 60 },
      { text: "Église", points: 23 },
      { text: "Bar/Boîte de nuit", points: 8 },
      { text: "Spa", points: 7 },
    ],
  },
  {
    question: "Quel est le pire endroit pour s'endormir accidentellement ?",
    answers: [
      { text: "Voiture/Au volant", points: 60 },
      { text: "Travail/Réunion", points: 17 },
      { text: "Bus/Train", points: 11 },
      { text: "Église", points: 11 },
    ],
  },
  {
    question: "Citez une raison pour laquelle quelqu'un pourrait faire semblant de dormir.",
    answers: [
      { text: "Pour éviter de faire la vaisselle", points: 30 },
      { text: "Esquiver un appel téléphonique", points: 25 },
      { text: "Fuir une conversation", points: 20 },
      { text: "Éviter les tâches ménagères", points: 15 },
      { text: "Feindre pendant une réunion ennuyeuse", points: 10 },
    ],
  },
  {
    question: "Citez un endroit où vous ne voudriez jamais entendre quelqu'un dire 'Oups !'",
    answers: [
      { text: "Salle d'opération", points: 35 },
      { text: "Dans un avion", points: 25 },
      { text: "Centrale nucléaire", points: 20 },
      { text: "Dans une bibliothèque", points: 10 },
      { text: "Pendant un entretien d'embauche", points: 5 },
    ],
  },
  {
    question: "Si votre réfrigérateur pouvait parler, quelle plainte aurait-il à votre sujet ?",
    answers: [
      { text: "Trop de nourriture périmée", points: 30 },
      { text: "L'ouvrir trop souvent", points: 25 },
      { text: "Ne pas nettoyer les renversements", points: 20 },
      { text: "Ignorer les légumes", points: 15 },
      { text: "Le remplir de restes bizarres", points: 10 },
    ],
  },
  {
    question: "Citez quelque chose que les gens font dans les ascenseurs quand ils pensent que personne ne les regarde.",
    answers: [
      { text: "Danser", points: 35 },
      { text: "Se regarder dans le miroir", points: 20 },
      { text: "Répéter leur discours de remerciement", points: 15 },
      { text: "Fixer les boutons de l'ascenseur", points: 5 },
    ],
  },
  {
    question: "Citez la partie la plus boursouflée de votre corps.",
    answers: [
      { text: "Ventre", points: 44 },
      { text: "Fesses", points: 16 },
      { text: "Cuisses", points: 10 },
      { text: "Poitrine", points: 6 },
      { text: "Bras", points: 6 },
      { text: "Hanches", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose que les gens font dans la salle de bain et qu'ils n'admettraient pas.",
    answers: [
      { text: "Chanter à tue-tête", points: 30 },
      { text: "Se parler à soi-même", points: 25 },
      { text: "Vérifier les réseaux sociaux", points: 20 },
      { text: "Essayer des pas de danse", points: 15 },
      { text: "Lire les étiquettes de shampooing", points: 10 },
    ],
  },
  {
    question: "Citez quelque chose dans quoi une personne pourrait se retrouver piégée.",
    answers: [
      { text: "La pluie", points: 24 },
      { text: "Un mensonge", points: 22 },
      { text: "Un piège", points: 10 },
      { text: "Les embouteillages", points: 10 },
      { text: "Un filet", points: 5 },
    ],
  },
  {
    question: "Il y a un cadavre dans la maison. Qu'en faites-vous ?",
    answers: [
      { text: "L'enterrer", points: 28 },
      { text: "Le cacher dans le frigo", points: 18 },
      { text: "Appeler la police quand même", points: 11 },
      { text: "Ne pas y toucher", points: 10 },
      { text: "Le brûler", points: 7 },
      { text: "L'amener chez le voisin", points: 7 },
      { text: "Le jeter dans le lac", points: 5 },
      { text: "À la poubelle", points: 5 },
    ],
  },
  {
    question: "Citez une raison que les hommes donnent pour leur calvitie.",
    answers: [
      { text: "Le stress", points: 31 },
      { text: "La virilité", points: 18 },
      { text: "L'hérédité", points: 14 },
      { text: "La vieillesse", points: 12 },
      { text: "L'intelligence", points: 8 },
      { text: "La femme", points: 6 },
    ],
  },
  {
    question: "Citez un métier dans lequel vous vous inquiéteriez des fuites.",
    answers: [
      { text: "Plombier", points: 66 },
      { text: "Politicien/Gouvernement", points: 16 },
      { text: "Capitaine de bateau", points: 4 },
      { text: "Gazier", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose que vous aimeriez voir pousser dans les arbres.",
    answers: [
      { text: "De l'argent", points: 35 },
      { text: "De la pizza", points: 25 },
      { text: "Du chocolat", points: 20 },
      { text: "Du linge propre", points: 10 },
      { text: "Du Wi-Fi", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose que vous trouveriez dans le tiroir bordélique d'un pirate.",
    answers: [
      { text: "Collection de cache-œil", points: 30 },
      { text: "Carte au trésor", points: 25 },
      { text: "Plumes de perroquet", points: 20 },
      { text: "Kit d'entretien du crochet", points: 15 },
      { text: "Accessoires pour jambe de bois", points: 10 },
    ],
  },
  {
    question: "Citez quelque chose qu'une personne très paresseuse ferait rapporter par son chien.",
    answers: [
      { text: "Le journal", points: 48 },
      { text: "Les pantoufles", points: 26 },
      { text: "La télécommande", points: 11 },
      { text: "Une bière", points: 7 },
      { text: "Les chaussures", points: 5 },
    ],
  },
  {
    question: "Citez un cadeau de mariage populaire.",
    answers: [
      { text: "Grille-pain", points: 24 },
      { text: "Argent", points: 22 },
      { text: "Vaisselle en porcelaine", points: 17 },
      { text: "Couverts en argent", points: 8 },
      { text: "Cristal", points: 6 },
      { text: "Mixeur", points: 3 },
      { text: "Bougie", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose que les gens font enlever de leur corps.",
    answers: [
      { text: "Grain de beauté", points: 37 },
      { text: "Tatouage", points: 21 },
      { text: "Dents", points: 9 },
      { text: "Amygdales", points: 9 },
      { text: "Verrues", points: 8 },
      { text: "Poils/Cheveux", points: 6 },
      { text: "Appendice", points: 5 },
      { text: "Vésicule biliaire", points: 4 },
    ],
  },
  {
    question: "Citez quelque chose que vous ne vendriez jamais même si vous étiez complètement fauché.",
    answers: [
      { text: "Bague/Bijoux", points: 26 },
      { text: "Mon corps", points: 14 },
      { text: "De la drogue", points: 13 },
      { text: "Ma maison", points: 8 },
      { text: "Ma voiture", points: 6 },
      { text: "Mon âme", points: 5 },
      { text: "Mes enfants", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose qu'une femme doit avoir avant de se marier.",
    answers: [
      { text: "Une bague", points: 30 },
      { text: "Un homme", points: 21 },
      { text: "Une robe", points: 9 },
      { text: "Un emploi", points: 7 },
      { text: "De l'argent/Un compte en banque", points: 5 },
      { text: "Un test sanguin", points: 4 },
    ],
  },
  {
    question: "Si votre téléphone sonne pendant que vous êtes à l'église, qui vaut mieux que ce soit ?",
    answers: [
      { text: "Le Seigneur", points: 61 },
      { text: "Mes enfants", points: 10 },
      { text: "Ma mère", points: 10 },
      { text: "Mon frère/Ma sœur", points: 4 },
      { text: "Mon conjoint", points: 3 },
      { text: "Mon patron", points: 3 },
      { text: "Le médecin", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose que vous allez faire dehors en robe de chambre.",
    answers: [
      { text: "Prendre le journal", points: 60 },
      { text: "Sortir les poubelles", points: 13 },
      { text: "Prendre le courrier", points: 8 },
      { text: "Arroser le jardin", points: 6 },
      { text: "Promener le chien", points: 3 },
      { text: "Parler au voisin", points: 3 },
      { text: "Chercher les enfants", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose que les gens ont de moins en vieillissant.",
    answers: [
      { text: "Cheveux", points: 40 },
      { text: "Énergie/Vitalité", points: 12 },
      { text: "Dents", points: 9 },
      { text: "Appétit", points: 9 },
      { text: "Patience", points: 7 },
    ],
  },
  {
    question: "Citez quelque chose que la personne la plus paresseuse du monde pourrait mettre à côté de son lit pour se retourner et l'utiliser.",
    answers: [
      { text: "Télécommande/TV", points: 34 },
      { text: "Toilettes", points: 28 },
      { text: "Réfrigérateur", points: 9 },
      { text: "Téléphone", points: 7 },
      { text: "Micro-ondes", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose de positif à vivre seul.",
    answers: [
      { text: "Liberté", points: 26 },
      { text: "Tranquillité", points: 25 },
      { text: "Intimité", points: 17 },
      { text: "Moins de ménage", points: 13 },
      { text: "Contrôle de la nourriture", points: 6 },
      { text: "Contrôle de la télécommande", points: 4 },
    ],
  },
  {
    question: "Que feriez-vous si vous voyiez un fantôme ?",
    answers: [
      { text: "Crier", points: 42 },
      { text: "Lui parler", points: 24 },
      { text: "Courir", points: 18 },
      { text: "Prier", points: 4 },
      { text: "S'évanouir", points: 3 },
      { text: "Me pincer", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose qui peut gâcher le dîner.",
    answers: [
      { text: "Nourriture brûlée", points: 37 },
      { text: "Appel téléphonique", points: 11 },
      { text: "Dispute", points: 9 },
      { text: "Grignoter avant", points: 7 },
      { text: "Cheveu dans la nourriture", points: 6 },
      { text: "Invité en retard", points: 4 },
    ],
  },
  {
    question: "Citez un bruit que les gens ne peuvent pas s'empêcher de faire.",
    answers: [
      { text: "Rôt", points: 29 },
      { text: "Éternuement", points: 26 },
      { text: "Ronflement", points: 10 },
      { text: "Pet", points: 10 },
      { text: "Hoquet", points: 9 },
      { text: "Toux", points: 4 },
    ],
  },
  {
    question: "Quelle est la chose la plus embarrassante qui puisse arriver pendant un entretien d'embauche ?",
    answers: [
      { text: "Appeler le recruteur 'Maman' par accident", points: 42 },
      { text: "Oublier le nom de l'entreprise/du recruteur", points: 35 },
      { text: "Trébucher et tomber", points: 14 },
      { text: "Porter des chaussettes dépareillées", points: 4 },
    ],
  },
  {
    question: "Dites-moi quelque chose qui peut être frustrant à utiliser pour la toute première fois.",
    answers: [
      { text: "Ordinateur/Internet", points: 23 },
      { text: "Lecteur DVD/Magnétoscope", points: 13 },
      { text: "Voiture", points: 11 },
      { text: "Outils", points: 7 },
      { text: "Jeu vidéo", points: 6 },
      { text: "Ouvre-boîte", points: 6 },
    ],
  },
  {
    question: "Citez une activité que beaucoup de gens font à moitié endormis.",
    answers: [
      { text: "Regarder la TV", points: 22 },
      { text: "Ronfler", points: 17 },
      { text: "Parler", points: 12 },
      { text: "Marcher", points: 7 },
      { text: "Lire", points: 6 },
    ],
  },
  {
    question: "Citez quelque chose qui manque toujours lors d'une fête.",
    answers: [
      { text: "Boissons/Alcool", points: 45 },
      { text: "Glaçons", points: 31 },
      { text: "Nourriture", points: 9 },
      { text: "Verres/Gobelets", points: 4 },
      { text: "Papier toilette", points: 3 },
      { text: "Serviettes", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose que les gens étirent.",
    answers: [
      { text: "Jambes/Corps", points: 44 },
      { text: "Élastique", points: 22 },
      { text: "Budget/Argent", points: 12 },
      { text: "Vêtements/Chaussures", points: 11 },
      { text: "La vérité", points: 7 },
    ],
  },
  {
    question: "Dites-moi quelque chose qui a l'air terrible quand c'est mouillé.",
    answers: [
      { text: "Chiens/Animaux", points: 43 },
      { text: "Cheveux", points: 36 },
      { text: "Vêtements/Chaussures", points: 12 },
      { text: "Pain", points: 4 },
      { text: "Journal", points: 2 },
    ],
  },
  {
    question: "Citez des choses que vous ne voudriez jamais que votre enfant ramène à la maison.",
    answers: [
      { text: "Des poux", points: 28 },
      { text: "Un chat/Chien", points: 24 },
      { text: "Un mauvais bulletin scolaire", points: 19 },
      { text: "Des microbes", points: 13 },
      { text: "La police", points: 8 },
      { text: "Un petit ami/Une petite amie", points: 3 },
    ],
  },
  {
    question: "Citez quelque chose que vous avez et que vous aimeriez voir mieux fonctionner.",
    answers: [
      { text: "La voiture", points: 20 },
      { text: "L'ordinateur", points: 11 },
      { text: "TV/Télécommande", points: 9 },
      { text: "Mon corps", points: 8 },
      { text: "La machine à laver", points: 6 },
      { text: "Le téléphone portable", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose que les hommes détestent perdre.",
    answers: [
      { text: "Argent/Portefeuille", points: 29 },
      { text: "Cheveux", points: 26 },
      { text: "Clés", points: 14 },
      { text: "Les femmes", points: 10 },
      { text: "Emploi", points: 5 },
      { text: "Dispute", points: 4 },
    ],
  },
  {
    question: "Citez quelque chose dont vous feriez l'impasse si vous étiez en retard au travail.",
    answers: [
      { text: "Petit-déjeuner/Café", points: 80 },
      { text: "La douche", points: 6 },
      { text: "Répondre au téléphone", points: 3 },
      { text: "Se brosser les dents", points: 3 },
      { text: "Les infos/Journal", points: 2 },
      { text: "Le maquillage", points: 2 },
    ],
  },
  {
    question: "Citez quelque chose que les gens laissent s'accumuler.",
    answers: [
      { text: "Linge/Repassage", points: 51 },
      { text: "Vaisselle", points: 13 },
      { text: "Courrier", points: 10 },
      { text: "Factures", points: 10 },
    ],
  },
  {
    question: "Citez quelque chose qui est difficile à faire les yeux ouverts.",
    answers: [
      { text: "Dormir", points: 51 },
      { text: "Éternuer", points: 31 },
      { text: "S'embrasser", points: 14 },
      { text: "Nager", points: 4 },
    ],
  },
  {
    question: "Citez quelque chose que les parents disent être trop court.",
    answers: [
      { text: "L'enfance", points: 29 },
      { text: "La jupe de leur fille", points: 28 },
      { text: "L'été", points: 17 },
      { text: "L'argent", points: 11 },
      { text: "La vie", points: 10 },
      { text: "La patience", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose que les gens perdent dans les montagnes russes.",
    answers: [
      { text: "Argent", points: 29 },
      { text: "Leur déjeuner", points: 18 },
      { text: "Chapeau", points: 12 },
      { text: "Lunettes de soleil", points: 10 },
      { text: "Clés", points: 10 },
      { text: "Chaussure", points: 6 },
      { text: "Bijoux", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose qui vient par sept.",
    answers: [
      { text: "Les nains", points: 28 },
      { text: "Les péchés capitaux", points: 23 },
      { text: "Les merveilles du monde", points: 15 },
      { text: "Les jours de la semaine", points: 14 },
      { text: "Les mers", points: 9 },
      { text: "Les continents", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose sur lequel les hommes mentent le plus.",
    answers: [
      { text: "L'âge", points: 42 },
      { text: "Être célibataire", points: 20 },
      { text: "Les revenus", points: 19 },
      { text: "Succès avec les femmes", points: 6 },
      { text: "Le travail", points: 5 },
      { text: "Le poids", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose que les gens repoussent le plus longtemps possible.",
    answers: [
      { text: "Les factures", points: 36 },
      { text: "Le ménage", points: 27 },
      { text: "Se marier", points: 8 },
      { text: "Aller chez le dentiste", points: 8 },
      { text: "Aller chez le médecin", points: 5 },
    ],
  },
  {
    question: "Citez quelque chose que vous ne voulez faire qu'une seule fois.",
    answers: [
      { text: "Mourir", points: 23 },
      { text: "Se marier", points: 16 },
      { text: "Sauter en parachute", points: 14 },
      { text: "Partir en voyage", points: 8 },
      { text: "Opération chirurgicale", points: 4 },
      { text: "Aller en prison", points: 3 },
      { text: "Saut à l'élastique", points: 3 },
    ],
  },
  {
    question: "Citez une raison pour laquelle sourire pourrait faire mal.",
    answers: [
      { text: "Soins dentaires", points: 49 },
      { text: "Lèvres gercées", points: 14 },
      { text: "Blessure", points: 11 },
      { text: "Aphte", points: 9 },
      { text: "Tristesse", points: 6 },
      { text: "Coup de soleil", points: 5 },
    ],
  },
  {
    question: "Citez une utilisation bizarre pour un poulet en caoutchouc.",
    answers: [
      { text: "Butoir de porte professionnel", points: 26 },
      { text: "Partenaire de stand-up", points: 19 },
      { text: "Substitut de klaxon", points: 16 },
      { text: "Mannequin d'arts martiaux", points: 13 },
      { text: "Brise-glace en entretien d'embauche", points: 10 },
    ],
  },
  {
    question: "Si vous pouviez avoir une télécommande pour la vie, quel serait le premier bouton que vous ajouteriez ?",
    answers: [
      { text: "Pause pour les moments gênants", points: 27 },
      { text: "Avance rapide dans les embouteillages", points: 21 },
      { text: "Livraison instantanée de pizza", points: 18 },
      { text: "Retour en arrière pour revivre de bons souvenirs", points: 15 },
      { text: "Sourdine pour les gens agaçants", points: 10 },
    ],
  },
  {
    question: "Citez une corvée spécifique que les enfants font pour obtenir leur argent de poche.",
    answers: [
      { text: "Faire la vaisselle", points: 44 },
      { text: "Sortir les poubelles", points: 26 },
      { text: "Ranger la chambre", points: 15 },
      { text: "Tondre la pelouse", points: 10 },
    ],
  },
  {
    question: "Si Einstein avait raté une matière à l'école, laquelle aurait-ce pu être ?",
    answers: [
      { text: "Français/Langues", points: 41 },
      { text: "Sport/EPS", points: 34 },
      { text: "Arts plastiques", points: 13 },
      { text: "Histoire", points: 9 },
    ],
  },
  {
    question: "Citez quelque chose qu'un enfant dit quand il fait quelque chose de mal.",
    answers: [
      { text: "Désolé", points: 56 },
      { text: "Oups", points: 23 },
      { text: "Oh non", points: 12 },
      { text: "C'est pas moi", points: 8 },
    ],
  },
  {
    question: "Citez quelque chose qu'un enfant pourrait enterrer dans le jardin.",
    answers: [
      { text: "Un jouet", points: 60 },
      { text: "Un animal de compagnie", points: 18 },
      { text: "De l'argent", points: 17 },
      { text: "Une capsule temporelle", points: 3 },
    ],
  },
  {
    question: "Complétez cette phrase. La clé d'un mariage réussi c'est de ____ ensemble.",
    answers: [
      { text: "Dormir", points: 59 },
      { text: "Travailler", points: 15 },
      { text: "Parler", points: 13 },
      { text: "Rire", points: 9 },
    ],
  },
  {
    question: "Citez quelque chose que les gens laissent tremper toute une nuit.",
    answers: [
      { text: "Vêtements", points: 44 },
      { text: "Nourriture", points: 21 },
      { text: "Vaisselle", points: 15 },
      { text: "Dentier", points: 9 },
    ],
  },
  {
    question: "Citez quelque chose dans lequel les gens essaient de se faufiler.",
    answers: [
      { text: "Jean", points: 48 },
      { text: "Robe", points: 21 },
      { text: "Voiture", points: 17 },
      { text: "Ascenseur", points: 5 },
      { text: "Bus/Transport en commun", points: 4 },
      { text: "Maillot de bain", points: 3 },
    ],
  },
];
