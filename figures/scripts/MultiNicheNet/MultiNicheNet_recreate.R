# MultiNicheNet (multi-sample, multi-condition cell-cell communication) on Zeisel 2015: S1 cortex vs CA1,
# C1 chip as sample (pseudobulk, edgeR), shared non-pyramidal cell types. NicheNet v2 mouse priors (Zenodo 7074291).
# Group-comparison circos, sample-level LR product + ligand activity bubble plot, ligand-activity/target plot.
suppressPackageStartupMessages({library(multinichenetr); library(SingleCellExperiment); library(Seurat); library(dplyr); library(ggplot2)})
setwd(dirname(sub("--file=","",grep("--file=",commandArgs(FALSE),value=TRUE)))); set.seed(1)
D <- "../_data/nichenet"; stopifnot(file.exists(file.path(D, "ligand_target_matrix_nsga2r_final_mouse.rds")))  # fetched by NicheNet_recreate.R
ltm <- readRDS(file.path(D, "ligand_target_matrix_nsga2r_final_mouse.rds"))
lr <- readRDS(file.path(D, "lr_network_mouse_21122021.rds")) %>% mutate(ligand = from, receptor = to) %>% distinct(ligand, receptor)
colnames(ltm) <- make.names(colnames(ltm)); rownames(ltm) <- make.names(rownames(ltm))
lr <- lr %>% mutate(ligand = make.names(ligand), receptor = make.names(receptor)) %>% filter(ligand %in% colnames(ltm))
so <- readRDS("../_data/zeisel_seurat.rds"); so <- subset(so, subset = celltype %in% c("astrocytes_ependymal","endothelial-mural","interneurons","microglia","oligodendrocytes"))
sce <- as.SingleCellExperiment(so); rownames(sce) <- make.names(rownames(sce))
sce$celltype <- make.names(as.character(sce$celltype)); sce$sample <- paste0("chip", sub("_.*", "", colnames(sce))); sce$group <- as.character(sce$tissue)
keep <- names(which(table(sce$sample) >= 20)); sce <- sce[, sce$sample %in% keep]
contrasts_oi <- c("'sscortex-ca1hippocampus','ca1hippocampus-sscortex'")
contrast_tbl <- tibble(contrast = c("sscortex-ca1hippocampus","ca1hippocampus-sscortex"), group = c("sscortex","ca1hippocampus"))
out <- multi_nichenet_analysis(sce = sce, celltype_id = "celltype", sample_id = "sample", group_id = "group", batches = NA, covariates = NA,
  lr_network = lr, ligand_target_matrix = ltm, contrasts_oi = contrasts_oi, contrast_tbl = contrast_tbl, min_cells = 3, fraction_cutoff = .05,
  min_sample_prop = .3, logFC_threshold = .5, p_val_threshold = .05, p_val_adj = FALSE, empirical_pval = FALSE, top_n_target = 250, n.cores = 1, verbose = FALSE)  # single core: parallel workers died under memory pressure on the shared box
saveRDS(make_lite_output(out), "multinichenet_lite.rds")
top <- get_top_n_lr_pairs(out$prioritization_tables, 50, rank_per_group = FALSE)
cts <- sort(unique(c(top$sender, top$receiver))); cols <- setNames(RColorBrewer::brewer.pal(max(3, length(cts)), "Set2")[seq_along(cts)], cts)
png("v1_circos_%d.png", 1400, 1400, res = 170); circ <- make_circos_group_comparison(top, cols[sort(unique(top$sender))], cols[sort(unique(top$receiver))]); dev.off()
# combine per-group circos panels (+legend) into one image
fs <- sort(list.files(".", "^v1_circos_\\d+\\.png$")); if (length(fs)) { im <- lapply(fs, png::readPNG); png("v1_circos_group_comparison.png", 1400 * length(fs), 1400, res = 170); par(mfrow = c(1, length(fs)), mar = c(0,0,0,0)); for (i in im) { plot.new(); rasterImage(i, 0, 0, 1, 1) }; dev.off(); file.remove(fs) }
top20 <- get_top_n_lr_pairs(out$prioritization_tables, 20, rank_per_group = FALSE)
ggsave("v2_sample_lr_activity.png", make_sample_lr_prod_activity_plots(out$prioritization_tables, top20 %>% inner_join(out$prioritization_tables$group_prioritization_tbl %>% distinct(id, group, prioritization_score), by = c("id","group","prioritization_score"))), width = 16, height = 9, dpi = 110, bg = "white")
lt <- out$ligand_activities_targets_DEgenes$ligand_activities %>% filter(direction_regulation == "up")
lt_top <- lt %>% group_by(contrast) %>% distinct(ligand, receiver, contrast, activity_scaled) %>% slice_max(activity_scaled, n = 12) %>% ungroup()
g3 <- ggplot(lt_top, aes(receiver, reorder(ligand, activity_scaled), fill = activity_scaled)) + geom_tile(colour = "white") + facet_wrap(~ contrast, scales = "free_y") + scale_fill_gradient2(low = "#2166ac", mid = "white", high = "#b2182b") + theme_bw() + theme(axis.text.x = element_text(angle = 45, hjust = 1)) + labs(x = "receiver", y = "ligand", fill = "scaled\nactivity", title = "MultiNicheNet ligand activities per receiver and contrast")
ggsave("v3_ligand_activity_tiles.png", g3, width = 10, height = 6, dpi = 140, bg = "white")
