suppressPackageStartupMessages({library(UCell); library(Seurat); library(ggplot2); library(patchwork)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
so <- readRDS("../_data/zeisel_seurat.rds")
sigs <- list(Interneuron = c("Gad1","Gad2","Slc32a1","Pvalb","Sst","Vip","Npy","Lhx6"), Pyramidal = c("Slc17a7","Satb2","Neurod6","Tbr1","Camk2a","Nrgn"),
  Astro = c("Aqp4","Gfap","Aldh1l1","Slc1a3","Gja1","Sox9"), Oligo = c("Mbp","Plp1","Mog","Mag","Cldn11","Mobp"), Microglia = c("Cx3cr1","C1qa","Tmem119","P2ry12","Aif1","Csf1r"), Synaptic_plasticity = c("Arc","Fos","Egr1","Npas4","Junb","Nr4a1"))
so <- AddModuleScore_UCell(so, features = sigs, ncores = 2); sc <- paste0(names(sigs), "_UCell")
ggsave("v1_UCell_featureplots.png", FeaturePlot(so, sc, ncol = 3, order = TRUE) & scale_color_viridis_c(option = "A"), width = 12, height = 7, dpi = 110, bg = "white")
ggsave("v2_UCell_violins.png", VlnPlot(so, sc, pt.size = 0, ncol = 3) & theme(axis.title.x = element_blank()), width = 13, height = 7, dpi = 110, bg = "white")
ggsave("v3_UCell_dotplot.png", DotPlot(so, features = sc, scale = FALSE) + RotatedAxis() + scale_color_viridis_c() + ggtitle("Mean UCell score by cell type"), width = 8, height = 4.5, dpi = 140, bg = "white")
