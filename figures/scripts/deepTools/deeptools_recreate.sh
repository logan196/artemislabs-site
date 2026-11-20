#!/usr/bin/env bash
# deepTools computeMatrix -> plotHeatmap / plotProfile. Uses SIMULATED bigWig signal (sharp TSS peaks ~H3K4me3, broad ~H3K27ac, flat input) on a toy 5-Mb chr
set -euo pipefail; cd "$(dirname "$0")"; export PATH=$HOME/.local/bin:$PATH
python3 make_sim_bigwigs.py
computeMatrix reference-point -S sim_H3K4me3.bw sim_H3K27ac.bw sim_input.bw -R genes_active.bed genes_silent.bed --referencePoint TSS -a 3000 -b 3000 -bs 50 -o mat.gz -p 4 --skipZeros
plotHeatmap -m mat.gz -out v1_plotHeatmap.png --colorMap Reds Blues Greys --heatmapHeight 10 --dpi 130 --plotTitle "deepTools plotHeatmap (simulated signal)"
plotProfile -m mat.gz -out v2_plotProfile_perGroup.png --perGroup --dpi 130 --plotTitle "plotProfile --perGroup"
plotHeatmap -m mat.gz -out v3_kmeans3.png --kmeans 3 --colorMap viridis --dpi 130 --whatToShow "plot, heatmap and colorbar"
computeMatrix scale-regions -S sim_H3K4me3.bw sim_H3K27ac.bw -R genes_active.bed --regionBodyLength 4000 -a 2000 -b 2000 -bs 100 -o mat_sr.gz -p 4
plotProfile -m mat_sr.gz -out v4_scale_regions_profile.png --plotType se --dpi 130 --plotTitle "scale-regions metagene (mean +/- s.e.)"
