(function () {
  const defaults = Object.freeze({
    garmentX: 0,
    garmentY: 0,
    garmentScaleX: 1,
    garmentScaleY: 1,
    necklineY: 0,
    neckWidthScale: 1,
    necklineDepthScale: 1,
    collarX: 0,
    collarY: 0,
    collarScaleX: 1,
    collarScaleY: 1,
    detailX: 0,
    detailY: 0,
    detailScaleX: 1,
    detailScaleY: 1,
    detailLeftX: 0,
    detailLeftY: 0,
    detailRightX: 0,
    detailRightY: 0,
    lineScale: 1
  });

  const labels = {
    hoodie: "Hoodie",
    tee: "Crew Tee",
    vneck: "V-Neck Knit",
    collared: "Button-Up",
    blazer: "Blazer",
    jacket: "Zip Jacket",
    turtleneck: "Turtleneck",
    overalls: "Overalls",
    singlet: "Singlet",
    bare: "Bare",
    rugby: "Rugby Stripe",
    flannel: "Open Flannel",
    denim: "Denim Jacket",
    varsity: "Varsity Jacket",
    bomber: "Bomber Jacket",
    cardigan: "Cardigan",
    sweaterVest: "Sweater Vest",
    labCoat: "Lab Coat",
    scrubs: "Scrubs",
    chefCoat: "Chef Coat",
    apron: "Apron",
    securityVest: "Hi-Vis Vest",
    tracksuit: "Tracksuit Top",
    raincoat: "Raincoat",
    pinafore: "Pinafore",
    sariDrape: "Sari Drape",
    kurta: "Kurta",
    sequin: "Sequin Top",
    leather: "Biker Jacket"
  };

  const categories = {
    hoodie: "Core", tee: "Core", vneck: "Core", collared: "Core", blazer: "Core",
    jacket: "Core", turtleneck: "Core", overalls: "Core", singlet: "Core", bare: "Core",
    rugby: "Tops", scrubs: "Uniforms", chefCoat: "Uniforms", tracksuit: "Tops",
    sariDrape: "Formal", kurta: "Formal", sequin: "Formal",
    flannel: "Layers", denim: "Layers", varsity: "Layers", bomber: "Layers",
    cardigan: "Layers", sweaterVest: "Layers", labCoat: "Uniforms", apron: "Uniforms",
    securityVest: "Uniforms", raincoat: "Layers", pinafore: "Layers", leather: "Layers"
  };

  const palette = {
    hoodie: ["#5c6f43", "#d8be79", "#2f7a78"], tee: ["#2f7a78", "#d84e40", "#5369b8"],
    vneck: ["#7062a8", "#ddd6bf", "#315eaa"], collared: ["#3f78a5", "#f1f1eb", "#267c4f"],
    blazer: ["#384252", "#f1f1eb", "#8e3744"], jacket: ["#2b6795", "#f1f1eb", "#d6a24e"],
    turtleneck: ["#1f6f78", "#c58b31", "#f2dfcf"], overalls: ["#596f9b", "#f1f1eb", "#d6a24e"],
    singlet: ["#d76075", "#f1f1eb", "#171512"], bare: ["#2f7a78", "#f1f1eb", "#171512"],
    rugby: ["#246c5b", "#f0d35f", "#f1f1eb"], flannel: ["#b7443d", "#253244", "#2f7a78"],
    denim: ["#3d6f9e", "#d6a24e", "#2f7a78"], varsity: ["#a53845", "#f0f0e7", "#2f7a78"],
    bomber: ["#566f40", "#e0a33a", "#2f7a78"], cardigan: ["#7d5a8f", "#f2dfcf", "#1f6f78"],
    sweaterVest: ["#c58b31", "#283e6a", "#545454"], labCoat: ["#f4f6f4", "#2f7a78", "#2f7a78"],
    scrubs: ["#1e8c91", "#cbe7e6", "#1e8c91"], chefCoat: ["#f2f1e8", "#cc453c", "#f2f1e8"],
    apron: ["#2f7a78", "#e7b64f", "#545454"], securityVest: ["#242b34", "#e7f04a", "#2f7a78"],
    tracksuit: ["#315eaa", "#f3f0e7", "#315eaa"], raincoat: ["#e3b83e", "#384252", "#2f7a78"],
    pinafore: ["#4b5f9c", "#f1f1eb", "#2f7a78"], sariDrape: ["#d04e78", "#e3b83e", "#d04e78"],
    kurta: ["#2f7a5d", "#d8b65a", "#2f7a5d"], sequin: ["#4f3c8b", "#f0c94d", "#4f3c8b"],
    leather: ["#252933", "#cdd2d6", "#2f7a78"]
  };

  window.WhoClothingStudio = {
    version: 1,
    defaults,
    labels,
    categories,
    palette,
    profiles: window.WhoClothingStudio?.profiles || {}
  };
})();
