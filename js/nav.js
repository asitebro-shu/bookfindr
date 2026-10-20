(function(){
    let footerNavList = [
        { text: "About", href: "/about.html" },
        { text: "Privacy Policy", href: "/privacy-policy.html" },
        { text: "API Information", href: "/api-info.html" }
    ];
    footerNavList.forEach(item => {
        let link = document.createElement("a");
        link.textContent = item.text;
        link.href = item.href;
        document.querySelector("footer#main-footer nav").appendChild(link);
    });

})();
