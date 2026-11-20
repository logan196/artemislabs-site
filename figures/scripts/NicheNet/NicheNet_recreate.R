# NicheNet (nichenetr v2 priors, mouse, Zenodo 7074291): which glial/vascular ligands best explain the
# cortex-vs-CA1 programme in oligodendrocytes (Zeisel 2015)? Ligand activity, ligand->target heatmap,
# ligand->receptor heatmap, and a circlize circos of top links coloured by sender.
suppressPackageStartupMessages({library(nichenetr); library(Seurat); library(ggplot2); library(patchwork); library(circlize); library(dplyr)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE))))
D <- "../_data/nichenet"; Z <- "https://zenodo.org/record/7074291/files/"
for (f in c("ligand_target_matrix_nsga2r_final_mouse.rds","lr_network_mouse_21122021.rds","weighted_networks_nsga2r_final_mouse.rds"))
  if (!file.exists(file.path(D, f))) { dir.create(D, showWarnings = FALSE); options(timeout = 3600); download.file(paste0(Z, f), file.path(D, f), mode = "wb") }
ltm <- readRDS(file.path(D, "ligand_target_matrix_nsga2r_final_mouse.rds")); lr <- readRDS(file.path(D, "lr_network_mouse_21122021.rds")) %>% distinct(from, to)
wn <- readRDS(file.path(D, "weighted_networks_nsga2r_final_mouse.rds"))
so <- readRDS("../_data/zeisel_seurat.rds"); Idents(so) <- "celltype"
senders <- c("microglia","astrocytes_ependymal","endothelial-mural","interneurons"); receiver <- "oligodendrocytes"
nn <- nichenet_seuratobj_aggregate(seurat_obj = so, receiver = receiver, sender = senders, condition_colname = "tissue", condition_oi = "sscortex", condition_reference = "ca1hippocampus",
  ligand_target_matrix = ltm, lr_network = lr, weighted_networks = wn, expression_pct = 0.10, top_n_ligands = 20, top_n_targets = 150, assay_oi = "RNA")
saveRDS(nn[c("ligand_activities","top_ligands","ligand_target_df","ligand_receptor_df")], "nichenet_results.rds")
la <- nn$ligand_activities %>% filter(test_ligand %in% nn$top_ligands) %>% arrange(aupr_corrected)
g1 <- ggplot(la, aes(aupr_corrected, factor(test_ligand, levels = test_ligand))) + geom_segment(aes(x = 0, xend = aupr_corrected, yend = factor(test_ligand, levels = test_ligand)), colour = "grey70") + geom_point(aes(colour = aupr_corrected), size = 4) + scale_colour_gradient(low = "#fdd49e", high = "#d7301f") + theme_bw() + labs(x = "ligand activity (corrected AUPR)", y = NULL, colour = "AUPR", title = "NicheNet ligand activity")
ggsave("v1_ligand_activity.png", g1, width = 5.5, height = 6, dpi = 150, bg = "white")
ggsave("v4_ligand_target_heatmap.png", nn$ligand_target_heatmap + ggtitle("Ligand -> oligodendrocyte target regulatory potential (cortex vs CA1)") + theme(plot.title = element_text(size = 11)), width = 9, height = 6.5, dpi = 140, bg = "white")
ggsave("v2_ligand_receptor_heatmap.png", nn$ligand_receptor_heatmap + ggtitle("NicheNet prior ligand-receptor potential"), width = 9, height = 6.5, dpi = 130, bg = "white")
# circos (the v1 'make_circos' style), drawn with circlize: ligand coloured by sender with highest mean expression
avg <- AverageExpression(so, features = nn$top_ligands, group.by = "celltype", assays = "RNA")$RNA[, gsub("_","-", senders), drop = FALSE]
colnames(avg) <- senders; sender_of <- setNames(colnames(avg)[apply(avg, 1, which.max)], rownames(avg))
lt <- nn$ligand_target_df %>% group_by(ligand) %>% slice_max(weight, n = 4) %>% ungroup() %>% filter(ligand %in% names(sender_of))
lt$ligand <- paste0(lt$ligand, " "); scol <- setNames(c("#e41a1c","#4daf4a","#984ea3","#ff7f00"), senders)
gcol <- c(setNames(scol[sender_of[trimws(unique(lt$ligand))]], unique(lt$ligand)), setNames(rep("#377eb8", length(unique(lt$target))), unique(lt$target)))
png("v3_circos.png", 1500, 1500, res = 170); circos.par(gap.degree = 1.2); chordDiagram(as.data.frame(lt[, c("ligand","target","weight")]), grid.col = gcol, transparency = .35, directional = 1, direction.type = c("diffHeight","arrows"), link.arr.type = "big.arrow", annotationTrack = "grid", preAllocateTracks = list(track.height = .12))
circos.track(track.index = 1, panel.fun = function(x, y) circos.text(CELL_META$xcenter, CELL_META$ylim[1], CELL_META$sector.index, facing = "clockwise", niceFacing = TRUE, adj = c(0, .5), cex = .6), bg.border = NA)
legend("bottomleft", legend = c(senders, "oligodendrocyte target"), fill = c(scol, "#377eb8"), bty = "n", cex = .7); title("NicheNet top ligand -> target links"); circos.clear(); dev.off()
