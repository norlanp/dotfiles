return {
    "nvimtools/none-ls.nvim",
    config = function()
        local null_ls = require("null-ls")
        null_ls.setup({
            sources = {
                null_ls.builtins.formatting.stylua,
                null_ls.builtins.formatting.gofumpt,
                null_ls.builtins.formatting.black,
                null_ls.builtins.formatting.prettier,

                null_ls.builtins.diagnostics.eslint,
                null_ls.builtins.diagnostics.ruff,
                null_ls.builtins.diagnostics.mypy,

                null_ls.builtins.code_actions.refactoring,
                null_ls.builtins.code_actions.impl,
                null_ls.builtins.code_actions.gomodifytags,
                null_ls.builtins.code_actions.refactoring,
            },
        })
    end,
    requires = { "nvim-lua/plenary.nvim" },
}
