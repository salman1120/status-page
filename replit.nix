{ pkgs }: {
    deps = [
        pkgs.nodejs-18_x
        pkgs.nodePackages.typescript-language-server
        pkgs.nodePackages.yarn
        pkgs.postgresql
        pkgs.openssl_1_1
    ];
}
