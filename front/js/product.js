//Fonction globale qui va récupèrer l'ID du canapé selectionné et l'afficher dans la page product.html
(async function () {

  //récupération de l'id passée dans l'URL
  const canapeId = getCanapeId();
  console.log(canapeId); 

  //Récupération des données de l'API correspondant à l'id du produit sélectionnés dans la page d'acceuil
  const canap = await apiCanape(canapeId);
  console.log(canap);

  //Fonction d'affichage du produit sélectionné et injection de l'html dans la page product
  affichCanap(canap);

  //Récupération des données sélectionnées par l'utilisateur dans la page product et stockage dans local storage
  recupUserSelect(canap);
})();

/*********************Fonctions appelées dans la fonction globale***********************/

// Fonction de récupération du l'ID via le lien que l'on a paramètré dans index.html
function getCanapeId() {
  return new URL(location.href).searchParams.get("id");
}

//Fonction récupération de l'élément du tableau canapes de l'api avec la méthode fetch
function apiCanape(canapeId) {
  let url = `http://localhost:3000/api/products/${canapeId}`;
  return fetch(url)
    .then(function (res) {
      if (res.ok) {
        console.log(res);
        return res.json();
      }
    })
    .then(function (canap) {
      console.log(canap);
      return canap;
    })
    .catch(function (err) {
      alert("Erreur : " + err);
    });
}

//Fonction d'insertion des éléments du canapé selectionné dans la page product
function affichCanap(canap) {
  document.getElementsByClassName(
    "item__img"
  )[0].innerHTML = `<img src="${canap.imageUrl}" alt="${canap.altTxt}">`;
  document.getElementById("title").textContent = canap.name;
  document.getElementById("price").textContent = canap.price + ".00 ";
  document.getElementById("description").textContent = canap.description;
  //Boucle for pour afficher les couleurs du canapé dans le menu déroulant
  for (let i = 0; i < canap.colors.length; i += 1) {
    document.getElementById(
      "colors"
    ).innerHTML += `<option value="${canap.colors[i]}">${canap.colors[i]}</option>`;
  }
  console.log(canap.colors);
}

/*Fonction de récupération des valeurs sélectionnées par l'utilisateur dans un 
objet puis dans le localstorage */
function recupUserSelect(canap) {
  //On cible le bouton ajouter au panier
  const ajoutPanier = document.getElementById("addToCart");
  console.log(ajoutPanier);
  //Ecoute du clic sur Ajouter au panier
  ajoutPanier.addEventListener("click", (e) => {
    console.log(e);
    e.preventDefault();

    //récupération des valeurs sélectionnées par l'utilisateur
    let colorProduit = document.getElementById("colors").value;
    let quantityProduit = document.getElementById("quantity").value;

    //Récupération des valeurs produit de l'api et Groupement des valeurs dans un objet
    const userSelectProduit = {
      photo: canap.imageUrl,
      altTxt: canap.altTxt,
      nomProduit: canap.name,
      idProduit: canap._id,
      couleur: colorProduit,
      quantite: quantityProduit,
      prix: canap.price,
    };
    console.log(userSelectProduit);

    //Stockage des valeurs sélectionnées dans le local storage
    //Déclaration variable "produitDansLocalStorage" pour key et values dans le local storage
    let produitDansLocalStorage = JSON.parse(localStorage.getItem("produit"));
    console.log(produitDansLocalStorage);
    //JSON.parse pour convertir les données au format JSON en JS dans locol storage

    //fonction ajouter le produit dans le local storage
    const ajoutDansLocalStorage = () => {
      //ajout de l'objet des valeurs sélectionnées par l'utilisateur dans un tableau
      produitDansLocalStorage.push(userSelectProduit);
      //conversion en JSON et stockage dans la clé "produit" du local storage
      localStorage.setItem("produit", JSON.stringify(produitDansLocalStorage));
    };
    
    //fonction fenêtre de confirmation et choix aller sur page panier ou page d'acceuil
    const pageSelect = () => {
      if (
        window.confirm(`${canap.name}, ${colorProduit} a bien été ajouté au panier.
Consulter le panier : OK ou revenir à l'acceuil : ANNULER.`)
      ) {
        window.location.href = "cart.html";
      } else {
        window.location.href = "index.html";
      }
    };
    console.log(pageSelect);

    //Si produits présents dans le local storage
    if (produitDansLocalStorage) {
      console.log("Des produits sont présents dans le local storage.");
      //Pour tous les objets présents dans local storage
      for (let j = 0; j < produitDansLocalStorage.length; j += 1) {
        if (
          //si le produit selectioné a le même ID et la même couleur
          userSelectProduit.idProduit == produitDansLocalStorage[j].idProduit &&
          userSelectProduit.couleur == produitDansLocalStorage[j].couleur
        ) {
          console.log("Produit identique déjà présent dans le local storage");
          //alors on additionne la qté du produit selectioné à celle dans local storage
          userSelectProduit.quantite =
            parseInt(userSelectProduit.quantite) +
            parseInt(produitDansLocalStorage[j].quantite);
          //et efface l'objet dans local storage
          produitDansLocalStorage.splice(j, 1);
        }
      }
      //appel de la fonction d'ajout du produit sélectionné dans local storage pour mettre à jour les qtés
      ajoutDansLocalStorage();
      console.log(`Qté produit mise à jour : ${userSelectProduit.quantite}`);
      //Appel fenêtre de confirmation
      pageSelect();
    }
    //Pas de produits présents dans le local storage
    else {
      console.log("Pas de produits présents dans local storage.")
      //on crée un tableau qui contiendra les objets ajoutés dans local storage
      produitDansLocalStorage = [];
      //appel de la fonction d'ajout du produit sélectionné dans local storage
      ajoutDansLocalStorage();
      //Appel fenêtre de confirmation
      pageSelect();
    }
  });
}
