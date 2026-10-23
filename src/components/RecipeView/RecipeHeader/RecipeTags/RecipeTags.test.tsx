import { useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";

import { RecipeTags } from "./RecipeTags";

const EditableTags = ({ initialTags = ["italian"] }): React.JSX.Element => {
  const [tags, setTags] = useState(initialTags);
  return <RecipeTags tags={tags} editable onTagsChange={setTags} />;
};

describe("RecipeTags", () => {
  it.each(["Enter", ","])("adds a normalized tag with %s", (key) => {
    render(<EditableTags />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "  Dinner  " } });
    fireEvent.keyDown(input, { key });

    expect(
      screen.getByRole("button", { name: "Remove tag dinner" }),
    ).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it("commits pending input when focus leaves", () => {
    render(<EditableTags />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: " Quick " } });
    fireEvent.blur(input);

    expect(
      screen.getByRole("button", { name: "Remove tag quick" }),
    ).toBeInTheDocument();
    expect(input).toHaveValue("");
  });

  it.each([" ITALIAN ", "   "])("rejects invalid input %j", (value) => {
    const onTagsChange = jest.fn();
    render(
      <RecipeTags tags={["italian"]} editable onTagsChange={onTagsChange} />,
    );
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value } });
    fireEvent.keyDown(input, { key: "Enter" });
    fireEvent.blur(input);

    expect(onTagsChange).not.toHaveBeenCalled();
  });

  it("removes tags with the remove button and empty-input Backspace", () => {
    render(<EditableTags initialTags={["italian", "dinner"]} />);
    fireEvent.click(screen.getByRole("button", { name: "Remove tag dinner" }));
    expect(screen.queryByText("dinner")).not.toBeInTheDocument();

    const input = screen.getByRole("textbox");
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(screen.queryByText("italian")).not.toBeInTheDocument();
    expect(input).toHaveAttribute("placeholder", "Add tags\u2026");
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(input).toBeInTheDocument();
  });

  it("keeps Backspace editing text instead of removing a tag", () => {
    render(<EditableTags />);
    const input = screen.getByRole("textbox");
    fireEvent.change(input, { target: { value: "d" } });
    fireEvent.keyDown(input, { key: "Backspace" });
    expect(screen.getByText("italian")).toBeInTheDocument();
  });

  it("focuses the input when an existing tag is clicked", () => {
    render(<EditableTags />);
    fireEvent.click(screen.getByText("italian"));
    expect(screen.getByRole("textbox")).toHaveFocus();
  });

  it("preserves read-only tag navigation without rendering an input", () => {
    const onTagClick = jest.fn();
    render(<RecipeTags tags={["italian"]} onTagClick={onTagClick} />);
    fireEvent.click(screen.getByRole("button", { name: "italian" }));
    expect(onTagClick).toHaveBeenCalledWith("italian");
    expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
  });
});
