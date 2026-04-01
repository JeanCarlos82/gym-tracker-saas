<script lang="ts">
	let visible = $state(false);
	let message = $state('');
	let timer: ReturnType<typeof setTimeout>;

	export function show(msg: string, duration = 2500) {
		message = msg;
		visible = true;
		clearTimeout(timer);
		timer = setTimeout(() => { visible = false; }, duration);
	}
</script>

<div class="toast" class:show={visible}>{message}</div>
