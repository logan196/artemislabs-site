# decoupleR: PROGENy pathway and CollecTRI TF activities (ULM) on Zeisel 2015 (OmniPath networks fetched at run time):
# pathway activity heatmap per cell type, TF activity heatmap (top variable TFs), pathway score on UMAP.
suppressPackageStartupMessages({library(decoupleR); library(Seurat); library(dplyr); library(tidyr); library(pheatmap); library(ggplot2); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
so <- readRDS("../_data/zeisel_seurat.rds"); X <- as.matrix(GetAssayData(so, layer = "data"))
# OmnipathR's PROGENy/CollecTRI download failed here, so the networks are fetched with the Python decoupler 2.x (dc.op.*)
if (!file.exists("progeny_mouse.csv") || !file.exists("collectri_mouse.csv")) system("python3 -c \"import decoupler as dc; dc.op.progeny(organism='mouse',top=500).to_csv('progeny_mouse.csv',index=False); dc.op.collectri(organism='mouse').to_csv('collectri_mouse.csv',index=False)\"")
net_p <- read.csv("progeny_mouse.csv"); net_t <- read.csv("collectri_mouse.csv")
ap <- run_ulm(X, net_p, .source = "source", .target = "target", .mor = "weight", minsize = 5)
at <- run_ulm(X, net_t, .source = "source", .target = "target", .mor = "weight", minsize = 10)
agg <- function(a) { M <- a %>% pivot_wider(id_cols = condition, names_from = source, values_from = score) %>% tibble::column_to_rownames("condition") %>% as.matrix(); M <- M[colnames(so), ]
  t(sapply(split(seq_len(ncol(so)), so$celltype), function(i) colMeans(M[i, , drop = FALSE]))) }
P <- agg(ap); Tf <- agg(at); pal <- colorRampPalette(c("#2166ac","white","#b2182b"))(100)
png("v1_progeny_heatmap.png", 1300, 800, res = 150); pheatmap(P, scale = "column", color = pal, border_color = NA, main = "decoupleR PROGENy pathway activity (ULM, mean per cell type)"); dev.off()
top <- names(sort(apply(Tf, 2, var), decreasing = TRUE))[1:30]
png("v2_collectri_tf_heatmap.png", 1700, 800, res = 150); pheatmap(Tf[, top], scale = "column", color = pal, border_color = NA, main = "decoupleR CollecTRI TF activity: 30 most variable TFs"); dev.off()
M <- ap %>% filter(source %in% c("TGFb","Hypoxia","NFkB")) %>% select(condition, source, score) %>% pivot_wider(names_from = source, values_from = score)
so@meta.data[, paste0("progeny_", setdiff(names(M), "condition"))] <- as.data.frame(M)[match(colnames(so), M$condition), -1]
ps <- lapply(grep("^progeny_", colnames(so@meta.data), value = TRUE), function(f) FeaturePlot(so, f, order = TRUE) + scale_colour_gradient2(low = "#2166ac", mid = "grey90", high = "#b2182b") + ggtitle(sub("progeny_", "", f)))
ggsave("v3_pathway_umaps.png", wrap_plots(ps, nrow = 1), width = 14, height = 4.5, dpi = 130, bg = "white")
