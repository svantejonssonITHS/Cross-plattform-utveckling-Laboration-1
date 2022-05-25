import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Link, useLocation } from 'wouter';

export default function () {
	const [, setLocation] = useLocation();

	return (
		<main className="flex w-screen min-h-screen bg-gray-900">
			<Formik
				initialValues={{
					email: new URLSearchParams(window.location.search).get('email') || '',
					password: '',
					submitError: ''
				}}
				onSubmit={(values, { setErrors }) => {
					(async () => {
						const request = await fetch('/api/user/login', {
							method: 'POST',
							headers: {
								'Content-Type': 'application/json'
							},
							body: JSON.stringify(values)
						});
						const response = await request.json();
						if (response.success) {
							setLocation('/');
						} else {
							setErrors({ submitError: response.message });
						}
					})();
				}}
				validate={(values) => {
					const errors = {};

					if (values.email.trim() === '') {
						errors.email = 'An email is required';
					} else if (new RegExp(/^[^\s@]+@[^\s@]+\.[^\s@]+$/).test(values.email) === false) {
						errors.email = 'Invalid email address';
					}

					if (values.password.trim() === '') {
						errors.password = 'A password is required';
					}

					return errors;
				}}
			>
				{({ dirty, isSubmitting, isValid }) => (
					<Form className="flex flex-col m-auto w-full min-h-screen sm:w-fit sm:min-h-fit rounded-none sm:rounded-md bg-white p-6 border-2 border-neutral-400">
						<h2 className="text-3xl font-semibold mb-10">Login to start texting!</h2>
						<label className="flex flex-col">
							<p>
								<span>Email </span>
								<ErrorMessage component="span" name="email" className="text-red-500 text-sm italic" />
							</p>
							<Field
								name="email"
								type="email"
								className="rounded-md border-2 border-neutral-400 mb-5 p-1"
								autoFocus
							/>
						</label>
						<label className="flex flex-col">
							<p>
								<span>Password </span>
								<ErrorMessage
									component="span"
									name="password"
									className="text-red-500 text-sm italic"
								/>
							</p>
							<Field
								name="password"
								type="password"
								className="rounded-md border-2 border-neutral-400 mb-5 p-1"
							/>
						</label>
						<input
							disabled={!dirty || isSubmitting || !isValid}
							type="submit"
							value="Login"
							className="px-7 py-2 mb-2 rounded-md bg-green-500 disabled:bg-green-400 hover:bg-green-600 text-white font-semibold cursor-pointer"
						/>
						<ErrorMessage component="span" name="submitError" className="text-red-500 italic mb-2" />
						<span>
							<p>
								Don&#39;t have an account?{' '}
								<Link href="/register">
									<a className="text-green-500 font-semibold hover:underline">Register here!</a>
								</Link>
							</p>
						</span>
					</Form>
				)}
			</Formik>
		</main>
	);
}