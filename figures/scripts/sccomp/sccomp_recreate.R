# sccomp Bayesian compositional analysis (CmdStan backend) on Zeisel 2015: cortex vs CA1, C1 chip as sample.
# Pyramidal subtypes are tissue-exclusive so they are excluded. Posterior boxplots, 1D credible intervals,
# and the mean-variability 2D plot. Requires cmdstanr + CmdStan (installed with cmdstanr::install_cmdstan()).
suppressPackageStartupMessages({library(sccomp); library(Seurat); library(dplyr); library(ggplot2); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(1)
so <- readRDS("../_data/zeisel_seurat.rds")
md <- so@meta.data %>% mutate(chip = sub("_.*", "", rownames(.)), tissue = so$tissue, celltype = as.character(celltype)) %>% filter(!grepl("pyramidal", celltype))
keep <- names(which(table(md$chip) >= 10)); md <- md %>% filter(chip %in% keep)
cnt <- md %>% count(chip, tissue, celltype, name = "count") %>% tidyr::complete(tidyr::nesting(chip, tissue), celltype, fill = list(count = 0))
est <- cnt %>% sccomp_estimate(formula_composition = ~ tissue, sample = "chip", cell_group = "celltype", abundance = "count", cores = 2, verbose = FALSE) %>%
  sccomp_remove_outliers(cores = 2, verbose = FALSE) %>% sccomp_test()
write.csv(as.data.frame(select(est, -any_of(c("count_data")))) %>% mutate(across(where(is.list), ~ sapply(., function(z) paste(format(z), collapse = ";")))), "sccomp_results.csv", row.names = FALSE)
ggsave("v1_posterior_boxplot.png", sccomp_boxplot(est, factor = "tissue") + ggtitle("sccomp: proportions with posterior predictive (cortex vs CA1)"), width = 11, height = 5, dpi = 130, bg = "white")
p <- plot_1D_intervals(est); ggsave("v2_1D_intervals.png", ((if (inherits(p, "ggplot")) p else wrap_plots(p)) & labs(caption = NULL)) + plot_annotation(title = "sccomp credible intervals (composition / variability)"), width = 10, height = 4.5, dpi = 140, bg = "white")
p2 <- plot_2D_intervals(est); ggsave("v3_2D_mean_variability.png", (p2 & labs(caption = NULL)) + plot_annotation(title = "sccomp mean-variability association"), width = 10, height = 5.5, dpi = 140, bg = "white")
