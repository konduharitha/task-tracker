class TimezoneConverter {
  constructor() {
    this.sourceTimezone = document.getElementById('source-timezone');
    this.targetTimezone = document.getElementById('target-timezone');
    this.sourceTime = document.getElementById('source-time');
    this.sourceDate = document.getElementById('source-date');
    this.convertButton = document.getElementById('convert-time');
    this.resultDisplay = document.getElementById('converted-time');
    
    this.init();
  }

  init() {
    this.populateTimezones();
    this.setDefaultValues();
    this.setupEventListeners();
  }

  populateTimezones() {
    const timeZones = [
      { value: 'UTC', label: 'UTC' },
      { value: 'America/New_York', label: 'New York (EDT)' },
      { value: 'America/Los_Angeles', label: 'Los Angeles (PDT)' },
      { value: 'America/Chicago', label: 'Chicago (CDT)' },
      { value: 'Europe/London', label: 'London (BST)' },
      { value: 'Europe/Paris', label: 'Paris (CEST)' },
      { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
      { value: 'Asia/Shanghai', label: 'Shanghai (CST)' },
      { value: 'Asia/Dubai', label: 'Dubai (GST)' },
      { value: 'Australia/Sydney', label: 'Sydney (AEST)' },
      { value: 'Pacific/Auckland', label: 'Auckland (NZST)' }
    ];

    // Sort time zones alphabetically by label
    timeZones.sort((a, b) => a.label.localeCompare(b.label));

    // Populate both dropdowns
    [this.sourceTimezone, this.targetTimezone].forEach(select => {
      timeZones.forEach(tz => {
        const option = document.createElement('option');
        option.value = tz.value;
        option.textContent = tz.label;
        select.appendChild(option);
      });
    });
  }

  setDefaultValues() {
    // Set current date
    const now = new Date();
    this.sourceDate.value = now.toISOString().split('T')[0];
    
    // Set current time
    const timeString = now.toTimeString().slice(0, 5);
    this.sourceTime.value = timeString;

    // Try to detect user's timezone and set it as source
    try {
      const userTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (this.sourceTimezone.querySelector(`option[value="${userTimezone}"]`)) {
        this.sourceTimezone.value = userTimezone;
      }
    } catch (error) {
      console.warn('Could not detect user timezone:', error);
    }

    // Set UTC as default target timezone
    this.targetTimezone.value = 'UTC';

    // Initial conversion
    this.convertTime();
  }

  setupEventListeners() {
    this.convertButton.addEventListener('click', () => this.convertTime());
    
    // Auto-convert when any input changes
    this.sourceTimezone.addEventListener('change', () => this.convertTime());
    this.targetTimezone.addEventListener('change', () => this.convertTime());
    this.sourceTime.addEventListener('change', () => this.convertTime());
    this.sourceDate.addEventListener('change', () => this.convertTime());
  }

  calculateTimeDifference(sourceDate, targetDate) {
    const diffHours = (targetDate.getTime() - sourceDate.getTime()) / (1000 * 60 * 60);
    const absHours = Math.abs(diffHours);
    const hours = Math.floor(absHours);
    const minutes = Math.round((absHours - hours) * 60);
    
    if (hours === 0 && minutes === 0) return 'Same time';
    
    const sign = diffHours >= 0 ? '+' : '-';
    const hourText = hours > 0 ? `${hours}h` : '';
    const minuteText = minutes > 0 ? `${minutes}m` : '';
    const separator = (hours > 0 && minutes > 0) ? ' ' : '';
    
    return `${sign}${hourText}${separator}${minuteText}`;
  }

  convertTime() {
    try {
      const [hours, minutes] = this.sourceTime.value.split(':');
      const sourceDate = new Date(this.sourceDate.value);
      sourceDate.setHours(parseInt(hours), parseInt(minutes));

      // Create formatters
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric'
      });

      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: 'numeric',
        hour12: true
      });

      // Get formatted dates in both timezones
      const sourceOptions = { timeZone: this.sourceTimezone.value };
      const targetOptions = { timeZone: this.targetTimezone.value };

      const sourceDateTime = new Date(sourceDate.toLocaleString('en-US', sourceOptions));
      const targetDateTime = new Date(sourceDate.toLocaleString('en-US', targetOptions));

      const sourceFormatted = {
        date: dateFormatter.format(sourceDateTime),
        time: timeFormatter.format(sourceDateTime)
      };

      const targetFormatted = {
        date: dateFormatter.format(targetDateTime),
        time: timeFormatter.format(targetDateTime)
      };

      const timeDiff = this.calculateTimeDifference(sourceDateTime, targetDateTime);

      // Display the result
      this.resultDisplay.innerHTML = `
        <div class="conversion-box source">
          <div class="timezone-name">${this.sourceTimezone.options[this.sourceTimezone.selectedIndex].text}</div>
          <div class="time">${sourceFormatted.time}</div>
          <div class="date">${sourceFormatted.date}</div>
        </div>
        <div class="time-difference">
          <span class="diff-arrow">→</span>
          <span class="diff-text">${timeDiff}</span>
          <span class="diff-arrow">→</span>
        </div>
        <div class="conversion-box target">
          <div class="timezone-name">${this.targetTimezone.options[this.targetTimezone.selectedIndex].text}</div>
          <div class="time">${targetFormatted.time}</div>
          <div class="date">${targetFormatted.date}</div>
        </div>
      `;
    } catch (error) {
      this.resultDisplay.textContent = 'Invalid time or timezone selection';
      console.error('Conversion error:', error);
    }
  }
}

// Initialize converter when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new TimezoneConverter();
}); 