export function normalizeProjectData(projectData = {}) {
	return {
		...projectData,
		title: projectData?.title?.trim() ?? '',
		description: projectData?.description?.trim() ?? '',
	};
}
