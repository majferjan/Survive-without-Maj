function renderTextChallenge(container, challenge, onComplete) {
  const prompt = document.createElement('p');
  prompt.className = 'detail-copy text-prompt';
  prompt.textContent = challenge.message || '';
  container.append(prompt);
  if (typeof challenge.message !== 'string' || !challenge.message.trim() || typeof challenge.answer !== 'string' || !challenge.answer.trim()) {
    const notice = document.createElement('p'); notice.className = 'detail-copy';
    notice.textContent = 'This challenge is waiting for its creator to add a message and answer in challenges.js.';
    container.append(notice); return;
  }
  const form = document.createElement('form'); form.className = 'form-wrap';
  const label = document.createElement('label'); label.className = 'input-label';
  label.htmlFor = 'textAnswer'; label.textContent = 'YOUR ANSWER';
  const stack = document.createElement('div'); stack.className = 'form-stack';
  const input = document.createElement('input'); input.id = 'textAnswer'; input.className = 'answer-input';
  input.type = 'text'; input.autocomplete = 'off'; input.spellcheck = false;
  input.placeholder = 'Type your response'; input.setAttribute('aria-describedby', 'textAnswerFeedback');
  const button = document.createElement('button'); button.type = 'submit'; button.className = 'verify-button'; button.textContent = 'VERIFY';
  const feedback = document.createElement('p'); feedback.id = 'textAnswerFeedback'; feedback.className = 'feedback';
  feedback.setAttribute('role', 'status'); feedback.setAttribute('aria-live', 'polite');
  let solved = false;
  form.onsubmit = event => {
    event.preventDefault();
    if (solved) return;
    if (textAnswerMatches(input.value, challenge.answer)) {
      solved = true; button.disabled = true;
      onComplete();
    } else {
      feedback.textContent = input.value.trim() ? 'Not quite. Try again.' : 'Enter an answer first.';
      feedback.className = 'feedback is-visible is-bad'; input.focus();
    }
  };
  stack.append(input, button); form.append(label, stack, feedback); container.append(form);
}
