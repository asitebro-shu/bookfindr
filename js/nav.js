(function(){
    let mainNavList = [
        { text: "Home", href: "index.html" },
        { text: "My Reading", href: "myreading.html" },
    ];

    mainNavList.forEach(item => {
        const li = document.createElement('li');
        const link = document.createElement('a');
        link.textContent = item.text;
        link.href = item.href;
        li.appendChild(link);
        document.querySelector(".main-nav ul").appendChild(li);
    });

    // let footerNavList = [
    //     { text: "About", href: "/about.html" },
    //     { text: "Privacy Policy", href: "/privacy-policy.html" },
    //     { text: "API Information", href: "/api-info.html" }
    // ];
    // footerNavList.forEach(item => {
    //     let link = document.createElement("a");
    //     link.textContent = item.text;
    //     link.href = item.href;
    //     document.querySelector(".footer-nav").appendChild(link);
    // });

})();
