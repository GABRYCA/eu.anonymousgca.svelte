<script>
    /** @type {{data?: string, rotation?: number, height?: number}} */
    let { data = "000 000", rotation = 0, height = 280 } = $props();
</script>

<div class="row">
    <div class="col px-0">
        <svg id="wave" style="transform:rotate({rotation}deg);" viewBox="0 0 1440 {height}"
             xmlns="http://www.w3.org/2000/svg">
            <path fill-opacity="0.25"
                  d="{data}"></path>
        </svg>
    </div>
</div>
